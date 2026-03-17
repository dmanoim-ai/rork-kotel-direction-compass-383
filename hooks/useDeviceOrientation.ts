import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

interface OrientationData {
  isFlat: boolean;
  tiltAngle: number;
  isVertical: boolean;
  leftRightTilt: number; // negative = left side higher, positive = right side higher
  frontBackTilt: number; // negative = front higher, positive = back higher
}

export function useDeviceOrientation(): OrientationData {
  const [orientation, setOrientation] = useState<OrientationData>({
    isFlat: true,
    tiltAngle: 0,
    isVertical: false,
    leftRightTilt: 0,
    frontBackTilt: 0,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      setOrientation({ isFlat: true, tiltAngle: 0, isVertical: false, leftRightTilt: 0, frontBackTilt: 0 });
      return;
    }

    let subscription: { remove: () => void } | null = null;

    const setup = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (!isAvailable) {
          console.log('Accelerometer not available');
          return;
        }

        Accelerometer.setUpdateInterval(200);
        subscription = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
          const clampedZ = Math.max(-1, Math.min(1, z));
          const tiltAngle = Math.abs(Math.asin(clampedZ) * (180 / Math.PI));
          const isFlat = tiltAngle > 15;
          const isVertical = tiltAngle < 45;
          
          // x represents left/right tilt (roll)
          // y represents front/back tilt (pitch)
          const leftRightTilt = Math.max(-1, Math.min(1, x)) * 90;
          const frontBackTilt = Math.max(-1, Math.min(1, y)) * 90;

          setOrientation({
            isFlat,
            tiltAngle,
            isVertical,
            leftRightTilt,
            frontBackTilt,
          });
        });
      } catch (error) {
        console.error('Error setting up accelerometer:', error);
      }
    };

    setup();

    return () => {
      subscription?.remove();
    };
  }, []);

  return orientation;
}
