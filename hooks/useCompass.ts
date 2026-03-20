import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { Location as TargetLocation } from '@/constants/locations';

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

  const smoothedHeadingRef = useRef(0);
  const SMOOTHING_FACTOR = 0.15;
  const orientationRef = useRef<ScreenOrientation.Orientation>(ScreenOrientation.Orientation.PORTRAIT_UP);
  const headingSourceRef = useRef<'none' | 'os' | 'sensor'>('none');

  const magRef = useRef({ x: 0, y: 0, z: 0 });
  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const hasMagData = useRef(false);
  const hasAccelData = useRef(false);

  const applySmoothing = useCallback((rawHeading: number) => {
    const prev = smoothedHeadingRef.current;
    let delta = rawHeading - prev;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    const smoothed = (prev + delta * SMOOTHING_FACTOR + 360) % 360;
    smoothedHeadingRef.current = smoothed;
    setHeading(smoothed);
  }, []);

  const getOrientationOffset = useCallback((): number => {
    const ori = orientationRef.current;
    switch (ori) {
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return 90;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return -90;
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 180;
      default:
        return 0;
    }
  }, []);

  const computeSensorHeading = useCallback(() => {
    const ori = orientationRef.current;
    let ax = accelRef.current.x;
    let ay = accelRef.current.y;
    let az = accelRef.current.z;
    let mx = magRef.current.x;
    let my = magRef.current.y;
    let mz = magRef.current.z;

    switch (ori) {
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        [ax, ay] = [ay, -ax];
        [mx, my] = [my, -mx];
        break;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        [ax, ay] = [-ay, ax];
        [mx, my] = [-my, mx];
        break;
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        [ax, ay] = [-ax, -ay];
        [mx, my] = [-mx, -my];
        break;
    }

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

    const nx = gy * enz - gz * eny;

    let headingDeg = Math.atan2(enx, nx) * (180 / Math.PI);
    headingDeg = (headingDeg + 360) % 360;

    applySmoothing(headingDeg);
  }, [applySmoothing]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let headingSubscription: { remove: () => void } | null = null;
    let magnetometerSubscription: { remove: () => void } | null = null;
    let accelerometerSubscription: { remove: () => void } | null = null;
    let headingInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

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

    const setupOsHeading = async (): Promise<boolean> => {
      try {
        console.log('Setting up OS heading subscription (primary)');
        const sub = await Location.watchHeadingAsync((headingData) => {
          if (cancelled) return;
          const rawHeading = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          if (rawHeading >= 0) {
            const offset = getOrientationOffset();
            const adjusted = (rawHeading + offset + 360) % 360;
            applySmoothing(adjusted);
            setIsCalibrated(true);
            if (headingSourceRef.current !== 'os') {
              headingSourceRef.current = 'os';
              console.log('OS heading active, heading:', rawHeading.toFixed(1), 'offset:', offset);
            }
          }
        });
        headingSubscription = sub;
        console.log('OS heading subscription established');
        return true;
      } catch (err) {
        console.error('OS heading subscription failed:', err);
        return false;
      }
    };

    const setupSensorFallback = async () => {
      try {
        const magAvailable = await Magnetometer.isAvailableAsync();
        const accelAvailable = await Accelerometer.isAvailableAsync();
        console.log('Sensor fallback - Mag:', magAvailable, 'Accel:', accelAvailable);

        if (magAvailable && accelAvailable) {
          Magnetometer.setUpdateInterval(100);
          Accelerometer.setUpdateInterval(100);

          magnetometerSubscription = Magnetometer.addListener((data) => {
            magRef.current = data;
            if (!hasMagData.current) {
              hasMagData.current = true;
              console.log('First magnetometer data received (fallback)');
            }
            if (hasMagData.current && hasAccelData.current) {
              setIsCalibrated(true);
            }
          });

          accelerometerSubscription = Accelerometer.addListener((data) => {
            accelRef.current = data;
            if (!hasAccelData.current) {
              hasAccelData.current = true;
              console.log('First accelerometer data received (fallback)');
            }
          });

          headingInterval = setInterval(() => {
            if (hasMagData.current && hasAccelData.current) {
              computeSensorHeading();
            }
          }, 100);

          headingSourceRef.current = 'sensor';
          console.log('Sensor fallback active');
        } else {
          console.error('Required sensors not available for fallback');
          setError('Compass sensors unavailable');
        }
      } catch (err) {
        console.error('Sensor fallback setup failed:', err);
        setError('Compass sensors unavailable');
      }
    };

    const setup = async () => {
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
          const osHeadingOk = await setupOsHeading();
          if (!osHeadingOk) {
            console.log('OS heading failed, trying raw sensor fallback');
            await setupSensorFallback();
          }
        } else {
          setIsCalibrated(true);
        }
      } catch (err) {
        console.error('Error setting up compass:', err);
        setError('Failed to initialize sensors');
      }
    };

    void setup();

    return () => {
      cancelled = true;
      locationSubscription?.remove();
      headingSubscription?.remove();
      magnetometerSubscription?.remove();
      accelerometerSubscription?.remove();
      if (headingInterval) clearInterval(headingInterval);
    };
  }, [applySmoothing, getOrientationOffset, computeSensorHeading]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: ScreenOrientation.Subscription | null = null;

    const setup = async () => {
      try {
        const current = await ScreenOrientation.getOrientationAsync();
        orientationRef.current = current;
        console.log('Initial screen orientation:', current);

        subscription = ScreenOrientation.addOrientationChangeListener((event) => {
          orientationRef.current = event.orientationInfo.orientation;
          console.log('Screen orientation changed:', event.orientationInfo.orientation);
        });
      } catch (err) {
        console.log('Screen orientation detection not available:', err);
      }
    };

    void setup();

    return () => {
      if (subscription) {
        ScreenOrientation.removeOrientationChangeListener(subscription);
      }
    };
  }, []);

  const bearing = userLocation
    ? calculateBearing(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude
      )
    : 0;

  const direction = (bearing - heading + 360) % 360;

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude
      )
    : 0;

  return {
    heading,
    bearing,
    direction,
    distance,
    userLocation,
    accuracy,
    isCalibrated,
    error,
  };
}
