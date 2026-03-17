import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Compass,
  Smartphone,
  ChevronRight,
  Shield,
} from 'lucide-react-native';


const SETTINGS_CHECK_KEY = '@settings_check_shown';

interface CheckItem {
  id: string;
  label: string;
  status: 'checking' | 'ok' | 'warning' | 'error';
  message: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

interface SettingsCheckModalProps {
  onDismiss: () => void;
}

export function useSettingsCheck() {
  const [shouldShow, setShouldShow] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const shown = await AsyncStorage.getItem(SETTINGS_CHECK_KEY);
        if (!shown) {
          setShouldShow(true);
        }
      } catch (e) {
        console.log('Error checking settings flag:', e);
      }
      setIsReady(true);
    };
    void check();
  }, []);

  const dismiss = useCallback(async () => {
    setShouldShow(false);
    try {
      await AsyncStorage.setItem(SETTINGS_CHECK_KEY, 'true');
    } catch (e) {
      console.log('Error saving settings flag:', e);
    }
  }, []);

  return { shouldShow: isReady && shouldShow, dismiss };
}

export default function SettingsCheckModal({ onDismiss }: SettingsCheckModalProps) {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      void Linking.openSettings();
    }
  }, []);

  const openLocationSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('App-Prefs:Privacy&path=LOCATION');
    } else if (Platform.OS === 'android') {
      void Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
        void Linking.openSettings();
      });
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const runChecks = async () => {
      const results: CheckItem[] = [];

      if (Platform.OS === 'web') {
        let geoStatus: 'ok' | 'error' | 'warning' = 'checking' as 'ok' | 'error' | 'warning';
        if ('geolocation' in navigator) {
          try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            if (perm.state === 'granted') {
              geoStatus = 'ok';
            } else if (perm.state === 'denied') {
              geoStatus = 'error';
            } else {
              geoStatus = 'warning';
            }
          } catch {
            geoStatus = 'warning';
          }
        } else {
          geoStatus = 'error';
        }

        results.push({
          id: 'location',
          label: 'Location Access',
          status: geoStatus,
          message: geoStatus === 'ok'
            ? 'Location access granted'
            : geoStatus === 'error'
              ? 'Location access denied. Please allow in browser settings.'
              : 'Location access not yet granted. You will be prompted.',
          icon: <MapPin size={20} color={geoStatus === 'ok' ? '#4CAF50' : geoStatus === 'error' ? '#FF3B30' : '#FFB74D'} />,
        });

        setChecks(results);
        setIsChecking(false);
        return;
      }

      // 1. Check location services enabled
      let locationServicesEnabled = false;
      try {
        locationServicesEnabled = await Location.hasServicesEnabledAsync();
      } catch (e) {
        console.log('Error checking location services:', e);
      }

      results.push({
        id: 'location-services',
        label: 'Location Services',
        status: locationServicesEnabled ? 'ok' : 'error',
        message: locationServicesEnabled
          ? 'Location services are enabled'
          : 'Location services are OFF. Please enable them in Settings.',
        icon: <MapPin size={20} color={locationServicesEnabled ? '#4CAF50' : '#FF3B30'} />,
        actionLabel: !locationServicesEnabled ? 'Open Settings' : undefined,
        onAction: !locationServicesEnabled ? openSettings : undefined,
      });

      // 2. Check location permission
      let locationPermission: Location.PermissionStatus | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        locationPermission = status;
      } catch (e) {
        console.log('Error checking location permission:', e);
      }

      const permOk = locationPermission === Location.PermissionStatus.GRANTED;
      const permDenied = locationPermission === Location.PermissionStatus.DENIED;

      results.push({
        id: 'location-permission',
        label: 'Location Permission',
        status: permOk ? 'ok' : permDenied ? 'error' : 'warning',
        message: permOk
          ? 'Location permission granted'
          : permDenied
            ? 'Location permission denied. Please grant access in Settings.'
            : 'Location permission not yet granted. You will be prompted when using the compass.',
        icon: <Shield size={20} color={permOk ? '#4CAF50' : permDenied ? '#FF3B30' : '#FFB74D'} />,
        actionLabel: permDenied ? 'Open Settings' : undefined,
        onAction: permDenied ? openSettings : undefined,
      });

      // 3. Check magnetometer
      let magAvailable = false;
      try {
        magAvailable = await Magnetometer.isAvailableAsync();
      } catch (e) {
        console.log('Error checking magnetometer:', e);
      }

      results.push({
        id: 'magnetometer',
        label: 'Compass Sensor',
        status: magAvailable ? 'ok' : 'warning',
        message: magAvailable
          ? 'Magnetometer sensor available'
          : 'Magnetometer not detected. The app will use a fallback method which may be less accurate.',
        icon: <Compass size={20} color={magAvailable ? '#4CAF50' : '#FFB74D'} />,
      });

      // 4. Check accelerometer
      let accelAvailable = false;
      try {
        accelAvailable = await Accelerometer.isAvailableAsync();
      } catch (e) {
        console.log('Error checking accelerometer:', e);
      }

      results.push({
        id: 'accelerometer',
        label: 'Motion Sensor',
        status: accelAvailable ? 'ok' : 'warning',
        message: accelAvailable
          ? 'Accelerometer sensor available'
          : 'Accelerometer not detected. Tilt compensation may not work.',
        icon: <Smartphone size={20} color={accelAvailable ? '#4CAF50' : '#FFB74D'} />,
      });

      // 5. Platform-specific reminder
      if (Platform.OS === 'ios') {
        const calibrationOk = magAvailable;
        results.push({
          id: 'ios-calibration',
          label: 'Compass Calibration (iOS)',
          status: calibrationOk ? 'ok' : 'warning',
          message: calibrationOk
            ? 'Compass sensor is responding — calibration appears enabled.'
            : 'If compass is inaccurate, go to Settings > Privacy & Security > Location Services > System Services and enable "Compass Calibration".',
          icon: calibrationOk
            ? <Compass size={20} color="#4CAF50" />
            : <AlertTriangle size={20} color="#FFB74D" />,
          actionLabel: !calibrationOk ? 'Open Settings' : undefined,
          onAction: !calibrationOk ? openLocationSettings : undefined,
        });
      } else if (Platform.OS === 'android') {
        results.push({
          id: 'android-accuracy',
          label: 'High Accuracy Mode',
          status: 'warning',
          message: 'Go to Settings > Location and set mode to "High Accuracy" for best results. Also ensure "Precise" location is enabled for this app.',
          icon: <AlertTriangle size={20} color="#FFB74D" />,
          actionLabel: 'Open Settings',
          onAction: openSettings,
        });
      }

      setChecks(results);
      setIsChecking(false);
    };

    void runChecks();
  }, [openSettings, openLocationSettings]);

  const allGood = checks.every((c) => c.status === 'ok');
  const hasErrors = checks.some((c) => c.status === 'error');

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle size={18} color="#4CAF50" />;
      case 'error':
        return <XCircle size={18} color="#FF3B30" />;
      case 'warning':
        return <AlertTriangle size={18} color="#FFB74D" />;
      default:
        return <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />;
    }
  };

  return (
    <Modal transparent animationType="none" visible>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.modal}>
          <View style={styles.headerIcon}>
            {isChecking ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : allGood ? (
              <CheckCircle size={40} color="#4CAF50" />
            ) : hasErrors ? (
              <XCircle size={40} color="#FF3B30" />
            ) : (
              <AlertTriangle size={40} color="#FFB74D" />
            )}
          </View>

          <Text style={styles.title}>
            {isChecking
              ? 'Checking Settings...'
              : allGood
                ? 'All Set!'
                : hasErrors
                  ? 'Action Required'
                  : 'Almost Ready'}
          </Text>
          <Text style={styles.subtitle}>
            {isChecking
              ? 'Verifying your device settings for optimal compass accuracy.'
              : allGood
                ? 'Your device is configured for the best compass experience.'
                : 'Some settings need attention for optimal accuracy.'}
          </Text>

          {!isChecking && (
            <View style={styles.checksList}>
              {checks.map((check) => (
                <View key={check.id} style={styles.checkRow}>
                  <View style={styles.checkIconWrap}>{check.icon}</View>
                  <View style={styles.checkContent}>
                    <View style={styles.checkHeader}>
                      <Text style={styles.checkLabel}>{check.label}</Text>
                      {getStatusIcon(check.status)}
                    </View>
                    <Text style={styles.checkMessage}>{check.message}</Text>
                    {check.actionLabel && check.onAction && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={check.onAction}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>{check.actionLabel}</Text>
                        <ChevronRight size={14} color="#4FC3F7" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {!isChecking && (
            <TouchableOpacity
              style={[styles.dismissButton, allGood && styles.dismissButtonGood]}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={[styles.dismissButtonText, allGood && styles.dismissButtonTextGood]}>
                {allGood ? 'Start Using Compass' : 'Continue Anyway'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerIcon: {
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    lineHeight: 19,
    marginBottom: 20,
  },
  checksList: {
    gap: 14,
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  checkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  checkContent: {
    flex: 1,
  },
  checkHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 2,
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  checkMessage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 17,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#4FC3F7',
  },
  dismissButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dismissButtonGood: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  dismissButtonTextGood: {
    color: '#FFFFFF',
  },
});
