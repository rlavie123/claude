import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import type { AudioAnalysis } from '../types';

const { width: SW } = Dimensions.get('window');
const WAVE_WIDTH = SW - 32;
const WAVE_HEIGHT = 48;

function WaveForm({ history }: { history: number[] }) {
  if (history.length < 2) return null;

  const step = WAVE_WIDTH / Math.max(history.length - 1, 1);
  const points = history.map((v, i) => {
    const x = i * step;
    const y = WAVE_HEIGHT / 2 - (v - 0.5) * WAVE_HEIGHT * 0.85;
    return `${x},${y}`;
  });
  const d = `M ${points.join(' L ')}`;

  return (
    <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT}>
      {/* Baseline */}
      <Line x1={0} y1={WAVE_HEIGHT / 2} x2={WAVE_WIDTH} y2={WAVE_HEIGHT / 2} stroke="#333" strokeWidth={1} />
      {/* Waveform */}
      <Path d={d} stroke="#FF4444" strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

interface FrequencyBarProps {
  hz: number;
  label: string;
  min: number;
  max: number;
  color: string;
}

function FrequencyBar({ hz, label, min, max, color }: FrequencyBarProps) {
  const fill = Math.max(0, Math.min(1, (hz - min) / (max - min)));
  const barWidth = 80;
  return (
    <View style={styles.freqBarContainer}>
      <Text style={[styles.freqLabel, { color }]}>{label}</Text>
      <View style={[styles.freqTrack, { width: barWidth }]}>
        <View style={[styles.freqFill, { width: fill * barWidth, backgroundColor: color }]} />
        {/* Target zone marker */}
        <View style={[styles.freqMarker, { left: 0, width: barWidth }]} />
      </View>
      <Text style={[styles.freqHz, { color }]}>
        {hz > 0 ? `${hz} Hz` : '–'}
      </Text>
    </View>
  );
}

interface AudioMeterProps {
  audio: AudioAnalysis;
}

export function AudioMeter({ audio }: AudioMeterProps) {
  const levelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(levelAnim, {
      toValue: audio.level,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  }, [audio.level]);

  const barWidth = levelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, WAVE_WIDTH],
  });

  const statusColor = audio.isBuzzing
    ? (audio.insectType === 'mosquito' ? '#FF2222' : '#FF8800')
    : '#555';

  const statusText = audio.isBuzzing
    ? (audio.insectType === 'mosquito' ? '⚡ MOSQUITO BUZZ DETECTED' : '✦ FLY BUZZ DETECTED')
    : (audio.level > 0.25 ? '◌ SOUND DETECTED' : '· LISTENING…');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>AUDIO ANALYSIS</Text>
        <Text style={[styles.statusBadge, { color: statusColor }]}>{statusText}</Text>
      </View>

      {/* Waveform */}
      <View style={styles.waveContainer}>
        <WaveForm history={audio.levelHistory} />
      </View>

      {/* RMS level bar */}
      <View style={[styles.levelTrack, { width: WAVE_WIDTH }]}>
        <Animated.View style={[styles.levelFill, { width: barWidth }]} />
      </View>

      {/* Frequency targets */}
      <View style={styles.freqRow}>
        <FrequencyBar
          hz={audio.estimatedHz}
          label="MOSQUITO"
          min={380}
          max={650}
          color="#FF2222"
        />
        <View style={styles.freqDivider} />
        <FrequencyBar
          hz={audio.estimatedHz}
          label="FLY"
          min={140}
          max={250}
          color="#FF8800"
        />
      </View>

      <Text style={styles.hint}>
        Mosquito ♀ wing-beat: 400–600 Hz · Fly: 160–220 Hz
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  waveContainer: {
    marginBottom: 6,
  },
  levelTrack: {
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#FF4444',
    borderRadius: 2,
  },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  freqBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freqLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    width: 56,
  },
  freqTrack: {
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  freqFill: {
    height: '100%',
    borderRadius: 3,
  },
  freqMarker: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  freqHz: {
    fontSize: 9,
    fontWeight: '600',
    minWidth: 38,
    textAlign: 'right',
  },
  freqDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  hint: {
    color: '#444',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
