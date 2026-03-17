export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Antarctica';

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  continent?: Continent;
}

const COUNTRY_TO_CONTINENT: Record<string, Continent> = {
  'Israel': 'Asia',
  'USA': 'North America',
  'UK': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Austria': 'Europe',
  'Switzerland': 'Europe',
  'Japan': 'Asia',
  'China': 'Asia',
  'Singapore': 'Asia',
  'Australia': 'Oceania',
  'Canada': 'North America',
  'UAE': 'Asia',
  'Egypt': 'Africa',
  'South Africa': 'Africa',
  'India': 'Asia',
  'South Korea': 'Asia',
  'Thailand': 'Asia',
  'Russia': 'Europe',
  'Turkey': 'Asia',
  'Greece': 'Europe',
  'Portugal': 'Europe',
  'Ireland': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Hungary': 'Europe',
  'Argentina': 'South America',
  'Brazil': 'South America',
  'Mexico': 'North America',
  'Peru': 'South America',
  'Colombia': 'South America',
  'Chile': 'South America',
  'New Zealand': 'Oceania',
  'Malaysia': 'Asia',
  'Indonesia': 'Asia',
  'Philippines': 'Asia',
  'Vietnam': 'Asia',
};

export function getContinentForCountry(country: string): Continent | undefined {
  return COUNTRY_TO_CONTINENT[country];
}

export function getContinentFromTimezone(timezone: string | undefined): Continent | undefined {
  if (!timezone) return undefined;
  const prefix = timezone.split('/')[0];
  switch (prefix) {
    case 'Africa': return 'Africa';
    case 'America': return timezone.includes('South') || timezone.includes('Buenos') || timezone.includes('Lima') || timezone.includes('Bogota') || timezone.includes('Santiago') ? 'South America' : 'North America';
    case 'Asia': return 'Asia';
    case 'Atlantic': return 'Europe';
    case 'Australia': return 'Oceania';
    case 'Europe': return 'Europe';
    case 'Indian': return 'Asia';
    case 'Pacific': return 'Oceania';
    case 'Antarctica': return 'Antarctica';
    default: return undefined;
  }
}

const SOUTH_AMERICAN_TIMEZONES = [
  'America/Argentina', 'America/Bogota', 'America/Caracas', 'America/Cayenne',
  'America/Guayaquil', 'America/Guyana', 'America/La_Paz', 'America/Lima',
  'America/Montevideo', 'America/Paramaribo', 'America/Recife', 'America/Santiago',
  'America/Sao_Paulo', 'America/Asuncion', 'America/Belem', 'America/Boa_Vista',
  'America/Campo_Grande', 'America/Cuiaba', 'America/Fortaleza', 'America/Maceio',
  'America/Manaus', 'America/Noronha', 'America/Porto_Velho', 'America/Rio_Branco',
  'America/Santarem', 'America/Araguaina', 'America/Bahia',
];

export function refineContinentFromTimezone(timezone: string | undefined): Continent | undefined {
  if (!timezone) return undefined;
  const prefix = timezone.split('/')[0];
  switch (prefix) {
    case 'Africa': return 'Africa';
    case 'Asia': return 'Asia';
    case 'Atlantic': return 'Europe';
    case 'Australia': return 'Oceania';
    case 'Europe': return 'Europe';
    case 'Indian': return 'Asia';
    case 'Pacific': return 'Oceania';
    case 'Antarctica': return 'Antarctica';
    case 'America': {
      for (const tz of SOUTH_AMERICAN_TIMEZONES) {
        if (timezone.startsWith(tz)) return 'South America';
      }
      return 'North America';
    }
    default: return undefined;
  }
}

export const WORLD_CITIES: City[] = [
  { id: 'jerusalem', name: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137, continent: 'Asia' },
  { id: 'tel-aviv', name: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818, continent: 'Asia' },
  { id: 'new-york', name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060, continent: 'North America' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'USA', latitude: 34.0522, longitude: -118.2437, continent: 'North America' },
  { id: 'chicago', name: 'Chicago', country: 'USA', latitude: 41.8781, longitude: -87.6298, continent: 'North America' },
  { id: 'houston', name: 'Houston', country: 'USA', latitude: 29.7604, longitude: -95.3698, continent: 'North America' },
  { id: 'phoenix', name: 'Phoenix', country: 'USA', latitude: 33.4484, longitude: -112.0740, continent: 'North America' },
  { id: 'philadelphia', name: 'Philadelphia', country: 'USA', latitude: 39.9526, longitude: -75.1652, continent: 'North America' },
  { id: 'san-antonio', name: 'San Antonio', country: 'USA', latitude: 29.4241, longitude: -98.4936, continent: 'North America' },
  { id: 'san-diego', name: 'San Diego', country: 'USA', latitude: 32.7157, longitude: -117.1611, continent: 'North America' },
  { id: 'dallas', name: 'Dallas', country: 'USA', latitude: 32.7767, longitude: -96.7970, continent: 'North America' },
  { id: 'san-francisco', name: 'San Francisco', country: 'USA', latitude: 37.7749, longitude: -122.4194, continent: 'North America' },
  { id: 'seattle', name: 'Seattle', country: 'USA', latitude: 47.6062, longitude: -122.3321, continent: 'North America' },
  { id: 'boston', name: 'Boston', country: 'USA', latitude: 42.3601, longitude: -71.0589, continent: 'North America' },
  { id: 'miami', name: 'Miami', country: 'USA', latitude: 25.7617, longitude: -80.1918, continent: 'North America' },
  { id: 'atlanta', name: 'Atlanta', country: 'USA', latitude: 33.7490, longitude: -84.3880, continent: 'North America' },
  { id: 'denver', name: 'Denver', country: 'USA', latitude: 39.7392, longitude: -104.9903, continent: 'North America' },
  { id: 'london', name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278, continent: 'Europe' },
  { id: 'manchester', name: 'Manchester', country: 'UK', latitude: 53.4808, longitude: -2.2426, continent: 'Europe' },
  { id: 'birmingham', name: 'Birmingham', country: 'UK', latitude: 52.4862, longitude: -1.8904, continent: 'Europe' },
  { id: 'paris', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, continent: 'Europe' },
  { id: 'lyon', name: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357, continent: 'Europe' },
  { id: 'marseille', name: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698, continent: 'Europe' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, continent: 'Europe' },
  { id: 'munich', name: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.5820, continent: 'Europe' },
  { id: 'frankfurt', name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, continent: 'Europe' },
  { id: 'hamburg', name: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937, continent: 'Europe' },
  { id: 'rome', name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, continent: 'Europe' },
  { id: 'milan', name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900, continent: 'Europe' },
  { id: 'venice', name: 'Venice', country: 'Italy', latitude: 45.4408, longitude: 12.3155, continent: 'Europe' },
  { id: 'florence', name: 'Florence', country: 'Italy', latitude: 43.7696, longitude: 11.2558, continent: 'Europe' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, continent: 'Europe' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734, continent: 'Europe' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, continent: 'Europe' },
  { id: 'brussels', name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517, continent: 'Europe' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, continent: 'Europe' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417, continent: 'Europe' },
  { id: 'geneva', name: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432, continent: 'Europe' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, continent: 'Asia' },
  { id: 'osaka', name: 'Osaka', country: 'Japan', latitude: 34.6937, longitude: 135.5023, continent: 'Asia' },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.7681, continent: 'Asia' },
  { id: 'beijing', name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, continent: 'Asia' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737, continent: 'Asia' },
  { id: 'hong-kong', name: 'Hong Kong', country: 'China', latitude: 22.3193, longitude: 114.1694, continent: 'Asia' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, continent: 'Asia' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, continent: 'Oceania' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, continent: 'Oceania' },
  { id: 'brisbane', name: 'Brisbane', country: 'Australia', latitude: -27.4698, longitude: 153.0251, continent: 'Oceania' },
  { id: 'perth', name: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605, continent: 'Oceania' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, continent: 'North America' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207, continent: 'North America' },
  { id: 'montreal', name: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673, continent: 'North America' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, continent: 'Asia' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'UAE', latitude: 24.4539, longitude: 54.3773, continent: 'Asia' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, continent: 'Africa' },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241, continent: 'Africa' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473, continent: 'Africa' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, continent: 'Asia' },
  { id: 'delhi', name: 'Delhi', country: 'India', latitude: 28.7041, longitude: 77.1025, continent: 'Asia' },
  { id: 'bangalore', name: 'Bangalore', country: 'India', latitude: 12.9716, longitude: 77.5946, continent: 'Asia' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, continent: 'Asia' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018, continent: 'Asia' },
  { id: 'moscow', name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173, continent: 'Europe' },
  { id: 'saint-petersburg', name: 'Saint Petersburg', country: 'Russia', latitude: 59.9343, longitude: 30.3351, continent: 'Europe' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, continent: 'Asia' },
  { id: 'ankara', name: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597, continent: 'Asia' },
  { id: 'athens', name: 'Athens', country: 'Greece', latitude: 37.9838, longitude: 23.7275, continent: 'Europe' },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393, continent: 'Europe' },
  { id: 'porto', name: 'Porto', country: 'Portugal', latitude: 41.1579, longitude: -8.6291, continent: 'Europe' },
  { id: 'dublin', name: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603, continent: 'Europe' },
  { id: 'edinburgh', name: 'Edinburgh', country: 'UK', latitude: 55.9533, longitude: -3.1883, continent: 'Europe' },
  { id: 'stockholm', name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686, continent: 'Europe' },
  { id: 'oslo', name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, continent: 'Europe' },
  { id: 'copenhagen', name: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683, continent: 'Europe' },
  { id: 'helsinki', name: 'Helsinki', country: 'Finland', latitude: 60.1699, longitude: 24.9384, continent: 'Europe' },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122, continent: 'Europe' },
  { id: 'prague', name: 'Prague', country: 'Czech Republic', latitude: 50.0755, longitude: 14.4378, continent: 'Europe' },
  { id: 'budapest', name: 'Budapest', country: 'Hungary', latitude: 47.4979, longitude: 19.0402, continent: 'Europe' },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816, continent: 'South America' },
  { id: 'sao-paulo', name: 'S\u00e3o Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333, continent: 'South America' },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729, continent: 'South America' },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332, continent: 'North America' },
  { id: 'lima', name: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428, continent: 'South America' },
  { id: 'bogota', name: 'Bogot\u00e1', country: 'Colombia', latitude: 4.7110, longitude: -74.0721, continent: 'South America' },
  { id: 'santiago', name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693, continent: 'South America' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, continent: 'Oceania' },
  { id: 'wellington', name: 'Wellington', country: 'New Zealand', latitude: -41.2865, longitude: 174.7762, continent: 'Oceania' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, continent: 'Asia' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, continent: 'Asia' },
  { id: 'manila', name: 'Manila', country: 'Philippines', latitude: 14.5995, longitude: 120.9842, continent: 'Asia' },
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', latitude: 21.0278, longitude: 105.8342, continent: 'Asia' },
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', country: 'Vietnam', latitude: 10.8231, longitude: 106.6297, continent: 'Asia' },
];

export function searchCities(query: string): City[] {
  if (query.length < 3) return [];
  const lowerQuery = query.toLowerCase();
  return WORLD_CITIES.filter(city => 
    city.name.toLowerCase().startsWith(lowerQuery) ||
    city.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}
