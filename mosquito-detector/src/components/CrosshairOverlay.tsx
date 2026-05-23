import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { DetectedInsect } from '../types';

const { width: SW, height: SH } = Dimensions.get('window');

const MOSQUITO_COLOR = '#FF2222';
const FLY_COLOR = '#FF8800';

interface CrosshairProps {
  insect: DetectedInsect;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function SingleCrosshair({ insect }: CrosshairProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // Continuous pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();

    return () => { pulseAnim.stopAnimation(); fadeAnim.stopAnimation(); };
  }, []);

  const color = insect.type === 'mosquito' ? MOSQUITO_COLOR : FLY_COLOR;
  const cx = insect.x * SW;
  const cy = insect.y * SH;
  const bracket = 18;
  const gap = 22;
  const arm = 24;
  const confidencePct = Math.round(insect.confidence * 100);

  const pulseR = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 44] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]} pointerEvents="none">
      <Svg width={SW} height={SH}>
        {/* Pulsing outer ring */}
        <AnimatedCircle
          cx={cx} cy={cy}
          r={pulseR as unknown as number}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={pulseOpacity as unknown as number}
        />

        {/* Static targeting ring */}
        <Circle cx={cx} cy={cy} r={26} stroke={color} strokeWidth={1} fill="none" opacity={0.6} />

        {/* Crosshair arms */}
        <Line x1={cx - gap - arm} y1={cy} x2={cx - gap} y2={cy} stroke={color} strokeWidth={2} />
        <Line x1={cx + gap} y1={cy} x2={cx + gap + arm} y2={cy} stroke={color} strokeWidth={2} />
        <Line x1={cx} y1={cy - gap - arm} x2={cx} y2={cy - gap} stroke={color} strokeWidth={2} />
        <Line x1={cx} y1={cy + gap} x2={cx} y2={cy + gap + arm} stroke={color} strokeWidth={2} />

        {/* Corner bracket – top-left */}
        <Path
          d={`M ${cx - 26} ${cy - 26 + bracket} L ${cx - 26} ${cy - 26} L ${cx - 26 + bracket} ${cy - 26}`}
          stroke={color} strokeWidth={2.5} fill="none"
        />
        {/* Corner bracket – top-right */}
        <Path
          d={`M ${cx + 26 - bracket} ${cy - 26} L ${cx + 26} ${cy - 26} L ${cx + 26} ${cy - 26 + bracket}`}
          stroke={color} strokeWidth={2.5} fill="none"
        />
        {/* Corner bracket – bottom-left */}
        <Path
          d={`M ${cx - 26} ${cy + 26 - bracket} L ${cx - 26} ${cy + 26} L ${cx - 26 + bracket} ${cy + 26}`}
          stroke={color} strokeWidth={2.5} fill="none"
        />
        {/* Corner bracket – bottom-right */}
        <Path
          d={`M ${cx + 26 - bracket} ${cy + 26} L ${cx + 26} ${cy + 26} L ${cx + 26} ${cy + 26 - bracket}`}
          stroke={color} strokeWidth={2.5} fill="none"
        />

        {/* Centre dot */}
        <Circle cx={cx} cy={cy} r={2.5} fill={color} />

        {/* Label background */}
        <Rect
          x={cx - 42} y={cy + 32}
          width={84} height={30}
          rx={4} ry={4}
          fill="rgba(0,0,0,0.65)"
        />

        {/* Insect type label */}
        <SvgText
          x={cx} y={cy + 44}
          fill={color}
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >
          {insect.type === 'mosquito' ? '⚡ MOSQUITO' : '✦ FLY'}
        </SvgText>

        {/* Confidence */}
        <SvgText
          x={cx} y={cy + 57}
          fill="#FFFFFF"
          fontSize={9}
          textAnchor="middle"
          opacity={0.85}
        >
          {confidencePct}% {insect.audioMatch ? '+ AUDIO' : ''}
        </SvgText>
      </Svg>
    </Animated.View>
  );
}

interface CrosshairOverlayProps {
  insects: DetectedInsect[];
}

export function CrosshairOverlay({ insects }: CrosshairOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {insects.map(insect => (
        <SingleCrosshair key={insect.id} insect={insect} />
      ))}
    </View>
  );
}
