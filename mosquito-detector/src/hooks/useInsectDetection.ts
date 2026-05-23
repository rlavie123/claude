import { useState, useEffect, useRef, useCallback } from 'react';
import type { DetectedInsect, InsectType, AudioAnalysis } from '../types';

let idCounter = 0;
function nextId(): string { return `insect_${++idCounter}`; }

/** Mosquitoes hover slowly; flies dart erratically */
function createInsect(type: InsectType, audioBoost: number): DetectedInsect {
  const speed = type === 'mosquito' ? 0.002 : 0.006;
  const angle = Math.random() * Math.PI * 2;
  return {
    id: nextId(),
    type,
    x: 0.1 + Math.random() * 0.8,
    y: 0.15 + Math.random() * 0.7,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    confidence: 0.55 + Math.random() * 0.2 + audioBoost * 0.15,
    detectedAt: Date.now(),
    age: 0,
    audioMatch: audioBoost > 0.5,
  };
}

function updateInsect(ins: DetectedInsect, audio: AudioAnalysis): DetectedInsect {
  let { x, y, vx, vy, confidence, age } = ins;

  if (ins.type === 'mosquito') {
    // Slow Brownian hover
    vx += (Math.random() - 0.5) * 0.0008;
    vy += (Math.random() - 0.5) * 0.0008;
    const maxV = 0.003;
    vx = Math.max(-maxV, Math.min(maxV, vx));
    vy = Math.max(-maxV, Math.min(maxV, vy));
  } else {
    // Fly: occasional rapid direction change
    if (Math.random() < 0.06) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.004 + Math.random() * 0.006;
      vx = Math.cos(ang) * spd;
      vy = Math.sin(ang) * spd;
    }
  }

  x += vx;
  y += vy;

  // Bounce off screen edges
  if (x < 0.06 || x > 0.94) { vx *= -1; x = Math.max(0.06, Math.min(0.94, x)); }
  if (y < 0.12 || y > 0.92) { vy *= -1; y = Math.max(0.12, Math.min(0.92, y)); }

  // Boost confidence when audio frequency matches insect type
  const audioBoost = audio.isBuzzing && audio.insectType === ins.type ? 0.12 : 0;
  confidence = Math.max(0.5, Math.min(0.99, confidence + audioBoost - 0.001 + (Math.random() - 0.5) * 0.01));

  return { ...ins, x, y, vx, vy, confidence, age: age + 1, audioMatch: audioBoost > 0 };
}

/**
 * Simulates insect detection while providing real integration points.
 *
 * To integrate a real ML model replace the body of `spawnInsects` with your
 * inference results (e.g. from TFLite / a cloud vision API) and feed them
 * into `setInsects`. The hook's update loop and audio-fusion logic remain
 * unchanged.
 */
export function useInsectDetection(
  cameraReady: boolean,
  audio: AudioAnalysis,
) {
  const [insects, setInsects] = useState<DetectedInsect[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);

  const scheduleSpawn = useCallback(() => {
    const delay = 3000 + Math.random() * 6000;
    spawnRef.current = setTimeout(() => {
      setInsects(prev => {
        if (prev.length >= 3) { scheduleSpawn(); return prev; }
        const audioBoost = audio.isBuzzing ? audio.level : 0;
        const type: InsectType = audio.insectType ?? (Math.random() < 0.6 ? 'mosquito' : 'fly');
        const next = [...prev, createInsect(type, audioBoost)];
        countRef.current += 1;
        setTotalDetected(countRef.current);
        scheduleSpawn();
        return next;
      });
    }, delay);
  }, [audio.isBuzzing, audio.level, audio.insectType]);

  // Remove stale detections (> 12 seconds)
  const pruneOldInsects = useCallback(() => {
    const maxAge = 360; // ~12 s at 30 fps
    setInsects(prev => prev.filter(i => i.age < maxAge));
  }, []);

  useEffect(() => {
    if (!cameraReady) return;

    // Initial spawn with a short delay
    spawnRef.current = setTimeout(() => {
      const type: InsectType = Math.random() < 0.6 ? 'mosquito' : 'fly';
      setInsects([createInsect(type, 0)]);
      countRef.current = 1;
      setTotalDetected(1);
      scheduleSpawn();
    }, 2000);

    // 30 fps update loop
    frameRef.current = setInterval(() => {
      setInsects(prev => prev.map(ins => updateInsect(ins, audio)));
      pruneOldInsects();
    }, 33);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
      if (spawnRef.current) clearTimeout(spawnRef.current);
    };
  }, [cameraReady]);

  // Re-run spawn logic when audio matches an insect type
  useEffect(() => {
    if (!cameraReady || !audio.isBuzzing) return;
    setInsects(prev => prev.map(ins => updateInsect(ins, audio)));
  }, [audio.isBuzzing]);

  return { insects, totalDetected };
}
