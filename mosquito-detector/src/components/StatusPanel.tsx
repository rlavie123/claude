import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { DetectedInsect } from '../types';

interface StatusPanelProps {
  insects: DetectedInsect[];
  totalDetected: number;
  isScanning: boolean;
}

export function StatusPanel({ insects, totalDetected, isScanning }: StatusPanelProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isScanning) { scanAnim.setValue(0); return; }
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    return () => scanAnim.stopAnimation();
  }, [isScanning]);

  const mosquitoCount = insects.filter(i => i.type === 'mosquito').length;
  const flyCount = insects.filter(i => i.type === 'fly').length;

  const scanOpacity = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.container}>
      {/* App title */}
      <View style={styles.titleRow}>
        <Text style={styles.appTitle}>MOSQUITO · FLY</Text>
        <Animated.View style={[styles.scanIndicator, { opacity: scanOpacity }]}>
          <View style={[styles.scanDot, { backgroundColor: isScanning ? '#00FF88' : '#555' }]} />
          <Text style={[styles.scanText, { color: isScanning ? '#00FF88' : '#555' }]}>
            {isScanning ? 'SCANNING' : 'PAUSED'}
          </Text>
        </Animated.View>
        <Text style={styles.appSubtitle}>DETECTOR</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatChip label="ON SCREEN" value={insects.length.toString()} color="#FF2222" />
        <View style={styles.statDivider} />
        <StatChip label="MOSQUITO" value={mosquitoCount.toString()} color="#FF2222" />
        <View style={styles.statDivider} />
        <StatChip label="FLY" value={flyCount.toString()} color="#FF8800" />
        <View style={styles.statDivider} />
        <StatChip label="TOTAL" value={totalDetected.toString()} color="#AAAAAA" />
      </View>

      {/* Alert bar when insect detected */}
      {insects.length > 0 && (
        <View style={styles.alertBar}>
          <Text style={styles.alertText}>
            {insects.length === 1
              ? `⚠  ${insects[0].type.toUpperCase()} DETECTED — ${Math.round(insects[0].confidence * 100)}% confidence`
              : `⚠  ${insects.length} INSECTS DETECTED`}
          </Text>
        </View>
      )}
    </View>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingTop: 52,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appTitle: {
    color: '#FF2222',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appSubtitle: {
    color: '#FF2222',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scanDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  scanText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2A2A2A',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
  },
  chipValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chipLabel: {
    color: '#555',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  alertBar: {
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,34,34,0.15)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,34,34,0.3)',
  },
  alertText: {
    color: '#FF6666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
