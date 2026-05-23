import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import type { AudioAnalysis, InsectType } from '../types';

const HISTORY_SIZE = 40;
// Mosquito female wing-beat: ~400–600 Hz; fly: ~160–220 Hz
const MOSQUITO_HZ_MIN = 380;
const MOSQUITO_HZ_MAX = 650;
const FLY_HZ_MIN = 140;
const FLY_HZ_MAX = 250;

/** Estimate dominant frequency from rapid level oscillation timing */
function estimateFrequency(history: number[]): number {
  if (history.length < 4) return 0;
  let crossings = 0;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  for (let i = 1; i < history.length; i++) {
    if ((history[i - 1] < mean) !== (history[i] < mean)) crossings++;
  }
  // History sampled at ~50 ms intervals → 20 samples/sec
  // Zero-crossing rate: crossings / (duration_sec) / 2
  const durationSec = (history.length * 50) / 1000;
  return (crossings / durationSec) / 2;
}

function classifyByFrequency(hz: number): InsectType | null {
  if (hz >= MOSQUITO_HZ_MIN && hz <= MOSQUITO_HZ_MAX) return 'mosquito';
  if (hz >= FLY_HZ_MIN && hz <= FLY_HZ_MAX) return 'fly';
  return null;
}

export function useAudioAnalysis(enabled: boolean): AudioAnalysis {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelHistoryRef = useRef<number[]>([]);
  const buzzingFramesRef = useRef(0);

  const [analysis, setAnalysis] = useState<AudioAnalysis>({
    level: 0,
    estimatedHz: 0,
    isBuzzing: false,
    insectType: null,
    levelHistory: [],
  });

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: true,
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await rec.startAsync();
      recordingRef.current = rec;

      intervalRef.current = setInterval(async () => {
        const status = await rec.getStatusAsync();
        if (!status.isRecording) return;

        // metering returns dBFS (0 = full scale, negative = quieter)
        const rawDb = status.metering ?? -160;
        // Normalize: -160 dBFS → 0, 0 dBFS → 1
        const normalized = Math.max(0, Math.min(1, (rawDb + 80) / 80));

        const hist = levelHistoryRef.current;
        hist.push(normalized);
        if (hist.length > HISTORY_SIZE) hist.shift();

        const hz = estimateFrequency(hist);
        const insectType = classifyByFrequency(hz);

        // Require sustained signal above -40 dBFS to count as buzzing
        if (normalized > 0.5) {
          buzzingFramesRef.current = Math.min(buzzingFramesRef.current + 1, 10);
        } else {
          buzzingFramesRef.current = Math.max(buzzingFramesRef.current - 1, 0);
        }
        const isBuzzing = buzzingFramesRef.current >= 3;

        setAnalysis({
          level: normalized,
          estimatedHz: Math.round(hz),
          isBuzzing,
          insectType: isBuzzing ? insectType : null,
          levelHistory: [...hist],
        });
      }, 50);
    } catch {
      // Microphone unavailable – audio detection disabled silently
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch { /* already stopped */ }
      recordingRef.current = null;
    }
    setAnalysis({
      level: 0,
      estimatedHz: 0,
      isBuzzing: false,
      insectType: null,
      levelHistory: [],
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => { stopRecording(); };
  }, [enabled]);

  return analysis;
}
