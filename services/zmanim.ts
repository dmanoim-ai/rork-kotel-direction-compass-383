const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
}

function julianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yAdj = y + 4800 - a;
  const mAdj = m + 12 * a - 3;
  return d + Math.floor((153 * mAdj + 2) / 5) + 365 * yAdj + Math.floor(yAdj / 4) - Math.floor(yAdj / 100) + Math.floor(yAdj / 400) - 32045;
}

function sunDeclination(jd: number, longitude: number): { declination: number; jTransit: number } {
  const n = jd - 2451545.0 + 0.0008;
  const jStar = n - longitude / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const mRad = M * DEG_TO_RAD;
  const C = 1.9148 * Math.sin(mRad) + 0.02 * Math.sin(2 * mRad) + 0.0003 * Math.sin(3 * mRad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const lambdaRad = lambda * DEG_TO_RAD;
  const sinDec = Math.sin(lambdaRad) * Math.sin(23.4397 * DEG_TO_RAD);
  const declination = Math.asin(sinDec) * RAD_TO_DEG;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(mRad) - 0.0069 * Math.sin(2 * lambdaRad);
  return { declination, jTransit };
}

function hourAngle(latitude: number, declination: number, angle: number): number | null {
  const latRad = latitude * DEG_TO_RAD;
  const decRad = declination * DEG_TO_RAD;
  const cosH = (Math.sin(angle * DEG_TO_RAD) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  if (cosH > 1 || cosH < -1) return null;
  return Math.acos(cosH) * RAD_TO_DEG;
}

function jdToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const dayInt = Math.floor(day);
  const fracDay = day - dayInt;
  const hours = fracDay * 24;
  const h = Math.floor(hours);
  const mins = Math.floor((hours - h) * 60);
  const secs = Math.floor(((hours - h) * 60 - mins) * 60);
  return new Date(Date.UTC(year, month - 1, dayInt, h, mins, secs));
}

function getSunriseSunset(date: Date, latitude: number, longitude: number, angle: number = -0.833): SunTimes {
  const jd = julianDay(date);
  const { declination, jTransit } = sunDeclination(jd, longitude);
  const ha = hourAngle(latitude, declination, angle);
  if (ha === null) return { sunrise: null, sunset: null };
  const jRise = jTransit - ha / 360;
  const jSet = jTransit + ha / 360;
  return {
    sunrise: jdToDate(jRise),
    sunset: jdToDate(jSet),
  };
}

export interface ZmanimTimes {
  sunrise: Date | null;
  sofZmanShema: Date | null;
  chatzot: Date | null;
  shkiah: Date | null;
  tzeit: Date | null;
}

export function calculateZmanim(date: Date, latitude: number, longitude: number): ZmanimTimes {
  console.log('Calculating zmanim for:', date.toDateString(), 'lat:', latitude, 'lon:', longitude);

  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude, -0.833);

  if (!sunrise || !sunset) {
    console.log('Could not calculate sunrise/sunset (polar region?)');
    return { sunrise: null, sofZmanShema: null, chatzot: null, shkiah: null, tzeit: null };
  }

  const dayLengthMs = sunset.getTime() - sunrise.getTime();
  const shaahZmanit = dayLengthMs / 12;

  const sofZmanShema = new Date(sunrise.getTime() + 3 * shaahZmanit);

  const chatzot = new Date(sunrise.getTime() + 6 * shaahZmanit);

  const shkiah = sunset;

  const tzeitResult = getSunriseSunset(date, latitude, longitude, -8.5);
  const tzeit = tzeitResult.sunset;

  console.log('Zmanim calculated:', {
    sunrise: sunrise.toISOString(),
    sofZmanShema: sofZmanShema.toISOString(),
    chatzot: chatzot.toISOString(),
    shkiah: shkiah.toISOString(),
    tzeit: tzeit?.toISOString() ?? 'N/A',
  });

  return { sunrise, sofZmanShema, chatzot, shkiah, tzeit };
}
