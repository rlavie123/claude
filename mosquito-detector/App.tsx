import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';

import { useAudioAnalysis } from './src/hooks/useAudioAnalysis';
import { useInsectDetection } from './src/hooks/useInsectDetection';
import { CrosshairOverlay } from './src/components/CrosshairOverlay';
import { AudioMeter } from './src/components/AudioMeter';
import { StatusPanel } from './src/components/StatusPanel';

const { width: SW, height: SH } = Dimensions.get('window');

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioGranted, setAudioGranted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [showAudioPanel, setShowAudioPanel] = useState(true);

  // Scan-line animation
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: SH, duration: 3000, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Request audio permission
  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ granted }) => setAudioGranted(granted));
  }, []);

  const audio = useAudioAnalysis(isActive && audioGranted);
  const { insects, totalDetected } = useInsectDetection(cameraReady && isActive, audio);

  const handleCameraReady = useCallback(() => setCameraReady(true), []);
  const toggleActive = useCallback(() => setIsActive(p => !p), []);
  const toggleFacing = useCallback(
    () => setFacing(p => (p === 'back' ? 'front' : 'back')),
    []
  );

  // ── Permission screens ──────────────────────────────────────────────────────

  if (!cameraPermission) {
    return <View style={styles.permScreen} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permScreen}>
        <Text style={styles.permTitle}>CAMERA ACCESS REQUIRED</Text>
        <Text style={styles.permBody}>
          MosquitoDetector needs your camera to visually locate flying insects in real time.
        </Text>
        <TouchableOpacity style={styles.permButton} onPress={requestCameraPermission}>
          <Text style={styles.permButtonText}>GRANT CAMERA ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={handleCameraReady}
      />

      {/* Animated scan line */}
      {isActive && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineY }] },
          ]}
        />
      )}

      {/* Crosshair overlays for each detected insect */}
      {isActive && <CrosshairOverlay insects={insects} />}

      {/* Corner reticle decoration */}
      <View style={styles.cornerTL} pointerEvents="none" />
      <View style={styles.cornerTR} pointerEvents="none" />
      <View style={styles.cornerBL} pointerEvents="none" />
      <View style={styles.cornerBR} pointerEvents="none" />

      {/* Top status panel */}
      <StatusPanel insects={insects} totalDetected={totalDetected} isScanning={isActive && cameraReady} />

      {/* Spacer pushes controls to bottom */}
      <View style={{ flex: 1 }} pointerEvents="none" />

      {/* Control buttons */}
      <View style={styles.controls}>
        <ControlButton onPress={toggleFacing} label="FLIP" icon="⟲" />
        <ControlButton
          onPress={toggleActive}
          label={isActive ? 'PAUSE' : 'SCAN'}
          icon={isActive ? '⏸' : '▶'}
          highlight={!isActive}
        />
        <ControlButton
          onPress={() => setShowAudioPanel(p => !p)}
          label="AUDIO"
          icon="♬"
          highlight={showAudioPanel}
        />
      </View>

      {/* Audio meter panel */}
      {showAudioPanel && <AudioMeter audio={audio} />}

      {/* Demo watermark */}
      <View style={styles.demoTag} pointerEvents="none">
        <Text style={styles.demoText}>DEMO · Integrate TFLite model for production detection</Text>
      </View>
    </View>
  );
}

function ControlButton({
  onPress,
  label,
  icon,
  highlight = false,
}: {
  onPress: () => void;
  label: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.ctrlBtn, highlight && styles.ctrlBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.ctrlIcon}>{icon}</Text>
      <Text style={[styles.ctrlLabel, highlight && { color: '#FF2222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const CORNER_SIZE = 18;
const CORNER_THICK = 2.5;
const CORNER_INSET = 14;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  // ── Scan line ──
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,34,34,0.25)',
  },
  // ── Screen corners ──
  cornerTL: {
    position: 'absolute',
    top: CORNER_INSET + 100,
    left: CORNER_INSET,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: 'rgba(255,34,34,0.5)',
  },
  cornerTR: {
    position: 'absolute',
    top: CORNER_INSET + 100,
    right: CORNER_INSET,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: 'rgba(255,34,34,0.5)',
  },
  cornerBL: {
    position: 'absolute',
    bottom: CORNER_INSET + 160,
    left: CORNER_INSET,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: 'rgba(255,34,34,0.5)',
  },
  cornerBR: {
    position: 'absolute',
    bottom: CORNER_INSET + 160,
    right: CORNER_INSET,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: 'rgba(255,34,34,0.5)',
  },
  // ── Controls ──
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
  },
  ctrlBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minWidth: 72,
  },
  ctrlBtnActive: {
    borderColor: '#FF2222',
    backgroundColor: 'rgba(255,34,34,0.08)',
  },
  ctrlIcon: {
    color: '#CCCCCC',
    fontSize: 20,
    marginBottom: 2,
  },
  ctrlLabel: {
    color: '#888',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  // ── Demo tag ──
  demoTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  demoText: {
    color: '#333',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  // ── Permission screens ──
  permScreen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permTitle: {
    color: '#FF2222',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  permBody: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permButton: {
    backgroundColor: '#FF2222',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  permButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
