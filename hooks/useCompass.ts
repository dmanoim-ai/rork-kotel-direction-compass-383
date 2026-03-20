import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { Location as TargetLocation } from '@/constants/locations';

const IS_IPAD = Platform.OS === 'ios' && (Platform as { isPad?: boolean }).isPad === true;

function getOrientationOffset(orientation: ScreenOrientation.Orientation): number {
  switch (orientation) {
    case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
      return 90;
    case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
      return -90;
    case ScreenOrientation.Orientation.PORTRAIT_DOWN:
      return 180;
    default:
      return 0;
  }
}

interface CompassData {
  heading: number;
  bearing: number;
  direction: number;
  distance: number;
  userLocation: { latitude: number; longitude: number } | null;
  accuracy: number | null;
  isCalibrated: boolean;
  error: string | null;
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useCompass(target: TargetLocation): CompassData {
  const [heading, setHeading] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const magRef = useRef({ x: 0, y: 0, z: 0 });
  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const smoothedHeadingRef = useRef(0);
  const SMOOTHING_FACTOR = 0.15;
  const hasMagData = useRef(false);
  const hasAccelData = useRef(false);
  const [_orientationOffset, setOrientationOffset] = useState(0);

  const computeTiltCompensatedHeading = useCallback(() => {
    const ax = accelRef.current.x;
    const ay = accelRef.current.y;
    const az = accelRef.current.z;
    const mx = magRef.current.x;
    const my = magRef.current.y;
    const mz = magRef.current.z;

    const gravMag = Math.sqrt(ax * ax + ay * ay + az * az);
    if (gravMag < 0.1) return;

    const gx = ax / gravMag;
    const gy = ay / gravMag;
    const gz = az / gravMag;

    const ex = my * gz - mz * gy;
    const ey = mz * gx - mx * gz;
    const ez = mx * gy - my * gx;

    const eMag = Math.sqrt(ex * ex + ey * ey + ez * ez);
    if (eMag < 0.01) return;

    const enx = ex / eMag;
    const eny = ey / eMag;
    const enz = ez / eMag;

    const ny = enz * gx - enx * gz;

    let headingRad = Math.atan2(eny, ny);
    let headingDeg = headingRad * (180 / Math.PI);
    headingDeg = (headingDeg + 180 + 360) % 360;

    const prev = smoothedHeadingRef.current;
    let delta = headingDeg - prev;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;

    const smoothed = (prev + delta * SMOOTHING_FACTOR + 360) % 360;
    smoothedHeadingRef.current = smoothed;

    setHeading(smoothed);
  }, []);

  useEffect(() => {
    if (!IS_IPAD || Platform.OS === 'web') return;

    console.log('iPad detected – setting up orientation tracking for compass correction');
    ScreenOrientation.getOrientationAsync().then((o) => {
      const offset = getOrientationOffset(o);
      console.log('iPad initial orientation:', o, 'offset:', offset);
      setOrientationOffset(offset);
    }).catch((e) => console.log('Failed to get iPad orientation:', e));

    const sub = ScreenOrientation.addOrientationChangeListener((event) => {
      const offset = getOrientationOffset(event.orientationInfo.orientation);
      console.log('iPad orientation changed:', event.orientationInfo.orientation, 'offset:', offset);
      setOrientationOffset(offset);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let magnetometerSubscription: { remove: () => void } | null = null;
    let accelerometerSubscription: { remove: () => void } | null = null;
    let headingInterval: ReturnType<typeof setInterval> | null = null;

    const getLocationWithTimeout = async (acc: Location.Accuracy, timeoutMs: number): Promise<Location.LocationObject | null> => {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          console.log(`Location request timed out with accuracy ${acc}`);
          resolve(null);
        }, timeoutMs);

        Location.getCurrentPositionAsync({ accuracy: acc })
          .then((loc) => {
            clearTimeout(timer);
            resolve(loc);
          })
          .catch((err) => {
            clearTimeout(timer);
            console.error(`Location error with accuracy ${acc}:`, err);
            resolve(null);
          });
      });
    };

    const setupSensors = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        let location = await getLocationWithTimeout(Location.Accuracy.High, 8000);
        if (!location) {
          console.log('Falling back to Balanced accuracy');
          location = await getLocationWithTimeout(Location.Accuracy.Balanced, 8000);
        }
        if (!location) {
          console.log('Falling back to Low accuracy');
          location = await getLocationWithTimeout(Location.Accuracy.Low, 5000);
        }

        if (location) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setAccuracy(location.coords.accuracy ?? null);
          console.log('Got initial location:', location.coords.latitude, location.coords.longitude);
        } else {
          console.error('Could not get initial location at any accuracy level');
        }

        try {
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 2000,
              distanceInterval: 3,
            },
            (loc) => {
              setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
              setAccuracy(loc.coords.accuracy ?? null);
            }
          );
        } catch (watchErr) {
          console.error('Error watching location:', watchErr);
          try {
            locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Low,
                timeInterval: 3000,
                distanceInterval: 10,
              },
              (loc) => {
                setUserLocation({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                });
                setAccuracy(loc.coords.accuracy ?? null);
              }
            );
          } catch (watchErr2) {
            console.error('Error watching location (low accuracy fallback):', watchErr2);
          }
        }

        if (Platform.OS !== 'web') {
          if (IS_IPAD) {
            console.log('iPad detected – using watchHeadingAsync directly (skipping raw sensors)');
            void setupHeadingFallback();
          } else {
          try {
            const magAvailable = await Magnetometer.isAvailableAsync();
            const accelAvailable = await Accelerometer.isAvailableAsync();
            console.log('Sensor availability - Mag:', magAvailable, 'Accel:', accelAvailable);

            if (magAvailable && accelAvailable) {
              Magnetometer.setUpdateInterval(100);
              Accelerometer.setUpdateInterval(100);

              magnetometerSubscription = Magnetometer.addListener((data: { x: number; y: number; z: number }) => {
                magRef.current = data;
                if (!hasMagData.current) {
                  hasMagData.current = true;
                  console.log('First magnetometer data received');
                }
                if (hasMagData.current && hasAccelData.current) {
                  setIsCalibrated(true);
                }
              });

              accelerometerSubscription = Accelerometer.addListener((data: { x: number; y: number; z: number }) => {
                accelRef.current = data;
                if (!hasAccelData.current) {
                  hasAccelData.current = true;
                  console.log('First accelerometer data received');
                }
              });

              headingInterval = setInterval(() => {
                if (hasMagData.current && hasAccelData.current) {
                  computeTiltCompensatedHeading();
                }
              }, 100);

              setTimeout(() => {
                if (!hasMagData.current || !hasAccelData.current) {
                  console.log('Sensors not responding after 5s, trying heading subscription fallback');
                  void setupHeadingFallback();
                }
              }, 5000);
            } else if (!magAvailable && accelAvailable) {
              console.log('Magnetometer not available, using heading subscription fallback');
              void setupHeadingFallback();
            } else {
              console.log('Required sensors not available, using heading subscription fallback');
              void setupHeadingFallback();
            }
          } catch (sensorErr) {
            console.error('Error setting up sensors:', sensorErr);
            void setupHeadingFallback();
          }
          }
        } else {
          setIsCalibrated(true);
        }
      } catch (err) {
        console.error('Error setting up sensors:', err);
        setError('Failed to initialize sensors');
      }
    };

    const setupHeadingFallback = async () => {
      try {
        console.log('Setting up heading subscription fallback');
        const headingSub = await Location.watchHeadingAsync((headingData) => {
          const newHeading = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          if (newHeading >= 0) {
            const prev = smoothedHeadingRef.current;
            let delta = newHeading - prev;
            if (delta > 180) delta -= 360;
            else if (delta < -180) delta += 360;
            const smoothed = (prev + delta * SMOOTHING_FACTOR + 360) % 360;
            smoothedHeadingRef.current = smoothed;
            setHeading(smoothed);
            setIsCalibrated(true);
          }
        });
        locationSubscription = headingSub as unknown as Location.LocationSubscription;
        console.log('Heading fallback active');
      } catch (headingErr) {
        console.error('Heading fallback failed:', headingErr);
        setError('Compass sensors unavailable');
      }
    };

    void setupSensors();

    return () => {
      locationSubscription?.remove();
      magnetometerSubscription?.remove();
      accelerometerSubscription?.remove();
      if (headingInterval) clearInterval(headingInterval);
    };
  }, [computeTiltCompensatedHeading]);

  const adjustedHeading = IS_IPAD ? (heading + 180) % 360 : heading;

  const bearing = userLocation
    ? calculateBearing(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude
      )
    : 0;

  const direction = (bearing - adjustedHeading + 360) % 360;

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude
      )
    : 0;

  return {
    heading: adjustedHeading,
    bearing,
    direction,
    distance,
    userLocation,
    accuracy,
    isCalibrated,
    error,
  };
}
