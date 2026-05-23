export type InsectType = 'mosquito' | 'fly';

export interface DetectedInsect {
  id: string;
  type: InsectType;
  /** Normalized 0–1 position on screen */
  x: number;
  y: number;
  /** Normalized velocity per frame */
  vx: number;
  vy: number;
  /** 0–1 combined visual + audio confidence */
  confidence: number;
  detectedAt: number;
  /** How many consecutive frames this detection has been active */
  age: number;
  audioMatch: boolean;
}

export interface AudioAnalysis {
  /** Normalized 0–1 RMS level */
  level: number;
  /** Estimated dominant frequency in Hz */
  estimatedHz: number;
  /** True when sustained buzzing is detected */
  isBuzzing: boolean;
  /** Inferred insect type based on frequency */
  insectType: InsectType | null;
  /** History of recent levels for waveform display */
  levelHistory: number[];
}

export interface DetectionState {
  insects: DetectedInsect[];
  totalDetected: number;
  isScanning: boolean;
}
