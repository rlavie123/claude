# Mosquito & Fly Detector

A React Native (Expo) mobile app that uses your phone's **camera** and **microphone** to detect and locate mosquitoes and flies in real time.

## Features

| Feature | Description |
|---------|-------------|
| 📷 Camera overlay | Full-screen live camera feed |
| 🎯 Red crosshairs | Animated targeting reticle locks on each detected insect |
| 🔊 Audio detection | Analyses wing-beat frequency — mosquito ♀ ~400–600 Hz, fly ~160–220 Hz |
| 📊 Audio waveform | Live waveform + per-species frequency bar |
| 🦟 / 🪰 Type label | Labels each detection MOSQUITO or FLY with confidence % |
| 🎵 Audio fusion | Confidence score rises when camera and audio agree |

## Getting Started

```bash
cd mosquito-detector
npm install
npx expo start
```

Scan the QR code in **Expo Go** (iOS/Android) or run on a simulator.

## Architecture

```
App.tsx                        ← root, camera + layout
src/
  hooks/
    useAudioAnalysis.ts        ← real-time microphone + frequency estimation
    useInsectDetection.ts      ← detection loop + position tracking
  components/
    CrosshairOverlay.tsx       ← SVG animated red crosshairs
    AudioMeter.tsx             ← waveform + frequency bars
    StatusPanel.tsx            ← top HUD (counts, scan status)
  types/index.ts               ← shared TypeScript interfaces
```

## Integrating a Real ML Model

The detection loop in `useInsectDetection.ts` uses **simulated flight paths** as a placeholder. To swap in a real model:

1. Add `react-native-fast-tflite` (TFLite) or `@tensorflow/tfjs-react-native`.
2. Load a YOLOv8-nano model trained on mosquito/fly images (convert to `.tflite`).
3. In `useInsectDetection.ts`, replace the `createInsect()` spawn logic with your model's bounding-box output.
4. Feed the real `x, y, width, height, confidence, class` into `DetectedInsect` objects.

The audio fusion, crosshair animation, and HUD all wire up automatically.

## Permissions

- **Camera** – visual insect detection
- **Microphone** – wing-beat frequency analysis

## Tech Stack

- Expo SDK 51
- expo-camera
- expo-av (audio metering)
- react-native-svg (crosshair / waveform rendering)
