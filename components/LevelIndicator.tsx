import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelIndicatorProps {
  leftRightTilt: number;
  frontBackTilt: number;
  isFlat: boolean;
}

export function LevelIndicator({ leftRightTilt, frontBackTilt, isFlat }: LevelIndicatorProps) {
  const leftBarHeight = useRef(new Animated.Value(0)).current;
  const rightBarHeight = useRef(new Animated.Value(0)).current;
  const topBarWidth = useRef(new Animated.Value(0)).current;
  const bottomBarWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const maxBarSize = SCREEN_HEIGHT * 0.25;
  const threshold = 5;

  useEffect(() => {
    const shouldShow = !isFlat;
    
    Animated.timing(fadeAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFlat, fadeAnim]);

  useEffect(() => {
    const leftHeight = leftRightTilt < -threshold 
      ? Math.min(Math.abs(leftRightTilt + threshold) / 45, 1) * maxBarSize 
      : 0;
    const rightHeight = leftRightTilt > threshold 
      ? Math.min((leftRightTilt - threshold) / 45, 1) * maxBarSize 
      : 0;

    const topWidth = frontBackTilt < -threshold 
      ? Math.min(Math.abs(frontBackTilt + threshold) / 45, 1) * maxBarSize 
      : 0;
    const bottomWidth = frontBackTilt > threshold 
      ? Math.min((frontBackTilt - threshold) / 45, 1) * maxBarSize 
      : 0;

    Animated.parallel([
      Animated.spring(leftBarHeight, {
        toValue: leftHeight,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(rightBarHeight, {
        toValue: rightHeight,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(topBarWidth, {
        toValue: topWidth,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(bottomBarWidth, {
        toValue: bottomWidth,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
    ]).start();
  }, [leftRightTilt, frontBackTilt, leftBarHeight, rightBarHeight, topBarWidth, bottomBarWidth, maxBarSize]);

  const getBarColor = (tiltValue: number) => {
    const absTilt = Math.abs(tiltValue);
    if (absTilt < 15) return Colors.compass.success;
    if (absTilt < 30) return Colors.compass.gold;
    return Colors.compass.warning;
  };

  const leftColor = getBarColor(leftRightTilt);
  const rightColor = getBarColor(leftRightTilt);
  const topColor = getBarColor(frontBackTilt);
  const bottomColor = getBarColor(frontBackTilt);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.leftBar,
          {
            height: leftBarHeight,
            backgroundColor: leftColor,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.rightBar,
          {
            height: rightBarHeight,
            backgroundColor: rightColor,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.topBar,
          {
            width: topBarWidth,
            backgroundColor: topColor,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.bottomBar,
          {
            width: bottomBarWidth,
            backgroundColor: bottomColor,
          },
        ]}
      />

      <View style={styles.leftIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: leftRightTilt < -threshold ? leftColor : 'transparent' }]} />
      </View>
      <View style={styles.rightIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: leftRightTilt > threshold ? rightColor : 'transparent' }]} />
      </View>
      <View style={styles.topIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: frontBackTilt < -threshold ? topColor : 'transparent' }]} />
      </View>
      <View style={styles.bottomIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: frontBackTilt > threshold ? bottomColor : 'transparent' }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 6,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ translateY: -50 }],
  },
  rightBar: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 6,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    transform: [{ translateY: -50 }],
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: 6,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ translateX: -50 }],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    height: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    transform: [{ translateX: -50 }],
  },
  leftIndicator: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  rightIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  topIndicator: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: [{ translateX: -6 }],
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: [{ translateX: -6 }],
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
