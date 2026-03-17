import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Line } from 'react-native-svg';
import Colors from '@/constants/colors';

interface CompassArrowProps {
  rotation: number;
  heading: number;
  size?: number;
  isOnTarget?: boolean;
}

export function CompassArrow({ rotation, heading, size = 300, isOnTarget = false }: CompassArrowProps) {
  const animatedRotation = React.useRef(new Animated.Value(rotation)).current;
  const currentRotation = React.useRef(rotation);
  const arrowScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(arrowScale, {
      toValue: isOnTarget ? 3.5 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [isOnTarget, arrowScale]);
  
  const animatedHeading = React.useRef(new Animated.Value(-heading)).current;
  const currentHeading = React.useRef(-heading);

  React.useEffect(() => {
    const prev = currentRotation.current;
    let delta = rotation - prev;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    const newValue = prev + delta;
    currentRotation.current = newValue;
    Animated.spring(animatedRotation, {
      toValue: newValue,
      useNativeDriver: true,
      tension: 40,
      friction: 12,
    }).start();
  }, [rotation, animatedRotation]);

  React.useEffect(() => {
    const targetHeading = -heading;
    const prev = currentHeading.current;
    let delta = targetHeading - prev;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    const newValue = prev + delta;
    currentHeading.current = newValue;
    Animated.spring(animatedHeading, {
      toValue: newValue,
      useNativeDriver: true,
      tension: 40,
      friction: 12,
    }).start();
  }, [heading, animatedHeading]);

  const rotateStr = animatedRotation.interpolate({
    inputRange: [-360, 0, 360, 720],
    outputRange: ['-360deg', '0deg', '360deg', '720deg'],
  });

  const headingRotateStr = animatedHeading.interpolate({
    inputRange: [-720, -360, 0, 360, 720],
    outputRange: ['-720deg', '-360deg', '0deg', '360deg', '720deg'],
  });

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.36;
  const tickOuterR = outerRadius;
  const majorTickInnerR = outerRadius - size * 0.065;
  const minorTickInnerR = outerRadius - size * 0.035;
  const tinyTickInnerR = outerRadius - size * 0.022;

  const ticks: React.ReactElement[] = [];
  for (let deg = 0; deg < 360; deg += 2) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const isMedium = deg % 10 === 0;
    let inner = tinyTickInnerR;
    let strokeW = 1;
    if (isMajor) {
      inner = majorTickInnerR;
      strokeW = 2;
    } else if (isMedium) {
      inner = minorTickInnerR;
      strokeW = 1.5;
    }
    const x1 = cx + Math.sin(rad) * tickOuterR;
    const y1 = cy - Math.cos(rad) * tickOuterR;
    const x2 = cx + Math.sin(rad) * inner;
    const y2 = cy - Math.cos(rad) * inner;
    ticks.push(
      <Line
        key={`tick-${deg}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#FFFFFF"
        strokeWidth={strokeW}
      />
    );
  }

  const degreeLabels: React.ReactElement[] = [];
  const labelRadius = outerRadius + size * 0.08;
  for (let deg = 0; deg < 360; deg += 30) {
    if (deg === 0 || deg === 90 || deg === 180 || deg === 270) continue;
    const rad = (deg * Math.PI) / 180;
    const x = cx + Math.sin(rad) * labelRadius;
    const y = cy - Math.cos(rad) * labelRadius;
    degreeLabels.push(
      <SvgText
        key={`deg-${deg}`}
        x={x}
        y={y}
        fontSize={size * 0.048}
        fill="#FFFFFF"
        textAnchor="middle"
        alignmentBaseline="central"
        fontWeight="300"
      >
        {deg}
      </SvgText>
    );
  }

  const cardinals = [
    { label: 'N', angle: 0, color: '#FFFFFF' },
    { label: 'E', angle: 90, color: '#FFFFFF' },
    { label: 'S', angle: 180, color: '#FFFFFF' },
    { label: 'W', angle: 270, color: '#FFFFFF' },
  ];

  const cardinalElements: React.ReactElement[] = cardinals.map(({ label, angle, color }) => {
    const rad = (angle * Math.PI) / 180;
    const r = outerRadius - size * 0.12;
    const x = cx + Math.sin(rad) * r;
    const y = cy - Math.cos(rad) * r;
    return (
      <SvgText
        key={`card-${label}`}
        x={x}
        y={y}
        fontSize={size * 0.09}
        fill={color}
        textAnchor="middle"
        alignmentBaseline="central"
        fontWeight="700"
      >
        {label}
      </SvgText>
    );
  });

  const centerCircleR = size * 0.11;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.compassRose, { transform: [{ rotate: headingRotateStr }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={outerRadius}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
            fill="none"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
            fill="none"
          />

          <G>{ticks}</G>
          <G>{degreeLabels}</G>
          <G>{cardinalElements}</G>


        </Svg>
      </Animated.View>

      <View style={[styles.centerOverlay, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={centerCircleR}
            fill={Colors.compass.centerGray ?? 'rgba(80,80,80,0.5)'}
          />
          <Line
            x1={cx}
            y1={cy - centerCircleR * 1.3}
            x2={cx}
            y2={cy + centerCircleR * 1.3}
            stroke={Colors.compass.crosshair ?? 'rgba(255,255,255,0.4)'}
            strokeWidth={0.8}
          />
          <Line
            x1={cx - centerCircleR * 1.3}
            y1={cy}
            x2={cx + centerCircleR * 1.3}
            y2={cy}
            stroke={Colors.compass.crosshair ?? 'rgba(255,255,255,0.4)'}
            strokeWidth={0.8}
          />
        </Svg>
      </View>

      <View style={[styles.topIndicator, { left: size / 2 - 1 }]}>
        <View style={styles.topIndicatorLine} />
      </View>

      <Animated.View
        style={[
          styles.arrowContainer,
          { width: size, height: size, transform: [{ rotate: rotateStr }, { scaleX: arrowScale }] },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Path
            d={`M ${cx} ${cy - size * 0.38} L ${cx + size * 0.006} ${cy - size * 0.02} L ${cx - size * 0.006} ${cy - size * 0.02} Z`}
            fill={isOnTarget ? '#FF3333' : '#FF0000'}
            opacity={0.95}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRose: {
    position: 'absolute' as const,
  },
  centerOverlay: {
    position: 'absolute' as const,
  },
  arrowContainer: {
    position: 'absolute' as const,
  },
  topIndicator: {
    position: 'absolute' as const,
    top: 0,
    zIndex: 10,
  },
  topIndicatorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#FF0000',
  },
});
