import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Smartphone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

interface OrientationWarningProps {
  visible: boolean;
}

// Screen dimensions available if needed

export function OrientationWarning({ visible }: OrientationWarningProps) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, pulseAnim, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotateX: rotateInterpolate },
              ],
            },
          ]}
        >
          <Smartphone size={80} color={Colors.compass.warning} />
        </Animated.View>
        
        <Text style={styles.title}>{t('orientation.title')}</Text>
        <Text style={styles.subtitle}>
          {t('orientation.subtitle')}
        </Text>
        <Text style={styles.instruction}>
          {t('orientation.instruction')}
        </Text>
        
        <View style={styles.phoneIllustration}>
          <View style={styles.phoneSide} />
          <View style={styles.phoneFlat} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.compass.text,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.compass.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: 280,
  },
  instruction: {
    fontSize: 15,
    color: Colors.compass.gold,
    textAlign: 'center' as const,
    lineHeight: 22,
    maxWidth: 280,
    marginTop: 16,
    fontWeight: '600' as const,
  },
  phoneIllustration: {
    marginTop: 40,
    flexDirection: 'row' as const,
    alignItems: 'flex-end',
    gap: 30,
  },
  phoneSide: {
    width: 24,
    height: 50,
    backgroundColor: Colors.compass.warning,
    borderRadius: 4,
    opacity: 0.4,
  },
  phoneFlat: {
    width: 50,
    height: 8,
    backgroundColor: Colors.compass.success,
    borderRadius: 4,
  },
});
