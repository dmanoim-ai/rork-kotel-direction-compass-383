import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Cellular from 'expo-cellular';

import { MapPin, Navigation, Star, WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompassArrow } from '@/components/CompassArrow';
import { OrientationWarning } from '@/components/OrientationWarning';
import SettingsCheckModal, { useSettingsCheck } from '@/components/SettingsCheckModal';
import { useCompass } from '@/hooks/useCompass';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useTargetLocation } from '@/context/TargetLocationContext';
import Colors from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { useFavourites } from '@/context/FavouritesContext';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.88, 360);

const IS_IPAD = Platform.OS === 'ios' && (Platform as { isPad?: boolean }).isPad === true;

export default function CompassScreen() {
  const insets = useSafeAreaInsets();
  const { targetLocation, isLoading: isLoadingTarget } = useTargetLocation();
  const compass = useCompass(targetLocation);
  const orientation = useDeviceOrientation();
  const settingsCheck = useSettingsCheck();
  const { t, distanceUnit } = useLanguage();
  const { addFavourite, isFavourite } = useFavourites();

  const [isWifiOnlyiPad, setIsWifiOnlyiPad] = useState<boolean>(false);
  const [iPadCheckDone, setiPadCheckDone] = useState<boolean>(!IS_IPAD);

  useEffect(() => {
    if (!IS_IPAD || Platform.OS === 'web') {
      setiPadCheckDone(true);
      return;
    }
    void (async () => {
      try {
        const carrier = await Cellular.getCarrierNameAsync();
        const generation = await Cellular.getCellularGenerationAsync();
        console.log('[iPad cellular check] carrier:', carrier, 'generation:', generation);
        const hasCellular = (carrier !== null && carrier !== '') ||
          (generation !== null && generation !== Cellular.CellularGeneration.UNKNOWN);
        if (!hasCellular) {
          console.log('[iPad cellular check] WiFi-only iPad detected');
          setIsWifiOnlyiPad(true);
        }
      } catch (e) {
        console.log('[iPad cellular check] error, assuming WiFi-only:', e);
        setIsWifiOnlyiPad(true);
      } finally {
        setiPadCheckDone(true);
      }
    })();
  }, []);

  const alreadySaved = isFavourite(targetLocation.latitude, targetLocation.longitude);

  const handleSave = useCallback(() => {
    if (alreadySaved) {
      Alert.alert(t('fav.alreadySaved'), t('fav.alreadySavedMsg'));
      return;
    }

    if (Platform.OS === 'web') {
      const name = window.prompt(t('fav.namePromptMsg'), targetLocation.name);
      if (name !== null) {
        addFavourite(targetLocation, name.trim() || targetLocation.name);
        Alert.alert(t('fav.added'));
      }
      return;
    }

    Alert.prompt(
      t('fav.namePromptTitle'),
      t('fav.namePromptMsg'),
      [
        { text: t('fav.cancel'), style: 'cancel' },
        {
          text: t('fav.ok'),
          onPress: (name?: string) => {
            addFavourite(targetLocation, name?.trim() || targetLocation.name);
            Alert.alert(t('fav.added'));
          },
        },
      ],
      'plain-text',
      targetLocation.name
    );
  }, [alreadySaved, targetLocation, addFavourite, t]);


  const isTiltedTooMuch = orientation.tiltAngle < 55;

  const formatDistance = (km: number): string => {
    if (distanceUnit === 'mi') {
      const miles = km * 0.621371;
      if (miles < 0.1) {
        return `${Math.round(miles * 5280)} ft`;
      }
      if (miles < 100) {
        return `${miles.toFixed(1)} mi`;
      }
      return `${Math.round(miles).toLocaleString()} mi`;
    }
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    if (km < 100) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km).toLocaleString()} km`;
  };

  const getCardinalDirection = (degrees: number): string => {
    const keys = ['cardinal.N', 'cardinal.NE', 'cardinal.E', 'cardinal.SE', 'cardinal.S', 'cardinal.SW', 'cardinal.W', 'cardinal.NW'];
    const index = Math.round(degrees / 45) % 8;
    return t(keys[index]);
  };

  if (!iPadCheckDone) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingFullScreen}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingFullScreenText}>
            {t('compass.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (isWifiOnlyiPad) {
    return (
      <View style={styles.container}>
        <View style={[styles.wifiOnlyScreen, { paddingTop: insets.top + 40 }]}>
          <View style={styles.wifiOnlyIconContainer}>
            <WifiOff size={64} color="#FF6B35" />
          </View>
          <Text style={styles.wifiOnlyTitle}>{t('compass.wifiOnlyTitle')}</Text>
          <Text style={styles.wifiOnlyMessage}>{t('compass.wifiOnlyiPad')}</Text>
        </View>
      </View>
    );
  }

  if (isLoadingTarget || (!compass.userLocation && !compass.error)) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingFullScreen}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingFullScreenText}>
            {isLoadingTarget ? t('compass.loading') : t('compass.gettingLocation')}
          </Text>
          <Text style={styles.loadingFullScreenSubtext}>
            {t('compass.pleaseWait')}
          </Text>
          <Text style={styles.loadingHintText}>
            {t('compass.holdFlatHint')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <View style={styles.targetInfo}>
            <MapPin size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.targetName}>{targetLocation.name}</Text>
          </View>
        </View>

        <View style={styles.compassContainer}>
          <CompassArrow rotation={compass.direction} heading={compass.heading} size={COMPASS_SIZE} isOnTarget={Math.abs(((compass.direction % 360) + 360) % 360 - 360) <= 2 || Math.abs(((compass.direction % 360) + 360) % 360) <= 2} />

          <View style={styles.bottomInfo}>
            <View style={styles.infoRow}>
              <MapPin size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoValue}>
                {compass.userLocation
                  ? `${Math.round(compass.bearing)}° ${getCardinalDirection(compass.bearing)} ${t('compass.directionTo')} ${targetLocation.name}`
                  : `${t('compass.directionTo')} ${targetLocation.name}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Navigation size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoValue}>
                {compass.userLocation ? formatDistance(compass.distance) : '—'}
              </Text>
            </View>

            <View style={styles.headingDisplay}>
              <Text style={styles.phonePointingLabel}>{t('compass.phonePointing')}</Text>
              <View style={styles.headingRow}>
                <Text style={styles.headingDegree}>{Math.round(compass.heading)}°</Text>
                <Text style={styles.headingCardinal}>
                  {getCardinalDirection(compass.heading)}
                </Text>
              </View>
            </View>
            {isTiltedTooMuch && (
              <>
                <Text style={styles.holdFlatText}>{t('compass.holdFlat')}</Text>
                <Text style={styles.rotateHintText}>{t('compass.rotateHint')}</Text>
              </>
            )}
          </View>
        </View>

        {compass.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{compass.error}</Text>
          </View>
        )}

        {!alreadySaved && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            testID="save-favourite-button"
            activeOpacity={0.7}
          >
            <Star
              size={16}
              color="rgba(255,255,255,0.7)"
              fill="transparent"
            />
            <Text style={styles.saveButtonText}>
              {t('fav.save')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <OrientationWarning visible={!orientation.isFlat} />

      {settingsCheck.shouldShow && (
        <SettingsCheckModal onDismiss={settingsCheck.dismiss} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  compassContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  headingDisplay: {
    alignItems: 'center',
    marginTop: 34,
  },
  phonePointingLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headingRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline',
    gap: 6,
  },
  headingDegree: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0,
  },
  headingCardinal: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  bottomInfo: {
    marginTop: 18,
    alignItems: 'center' as const,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bearingText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.4)',
  },
  holdFlatText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FF6B35',
    marginTop: 12,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  rotateHintText: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.compass.warning,
  },
  errorText: {
    color: Colors.compass.warning,
    textAlign: 'center',
    fontSize: 14,
  },
  loadingFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingFullScreenText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingFullScreenSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingHintText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  wifiOnlyScreen: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  wifiOnlyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 32,
  },
  wifiOnlyTitle: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  wifiOnlyMessage: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 17,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
    lineHeight: 26,
  },
  saveButton: {
    position: 'absolute' as const,
    bottom: 32,
    right: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.7)',
  },

});
