# Real-Time Audio Engine Blueprint

## Overview

This document outlines the Web Audio API architecture for the LoopPad audio engine, designed to support 8–16 pads with sub-10ms end-to-end latency for professional-grade real-time performance.

## Architecture Goals

- **Low Latency**: Sub-10ms end-to-end latency from user input to audio output
- **Scalability**: Support 8–16 simultaneous pads with complex signal chains
- **Polyphony**: Multiple voices per pad for overlapping sounds
- **Professional Quality**: Studio-grade audio processing with effects chains
- **Real-time Performance**: Zero dropouts, glitches, or buffer underruns

## Table of Contents

1. [Audio Graph Architecture](#audio-graph-architecture)
2. [Latency Targets and Strategies](#latency-targets-and-strategies)
3. [Per-Pad Signal Chain](#per-pad-signal-chain)
4. [Latency Budget Calculations](#latency-budget-calculations)
5. [UI Component Map](#ui-component-map)
6. [Implementation Roadmap](#implementation-roadmap)

---

## Audio Graph Architecture

### High-Level Node Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     AudioContext                            │
│  (sampleRate: 48000Hz, latencyHint: 'interactive')         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──────────────────┐
                            ↓                  ↓
                   ┌────────────────┐  ┌────────────────┐
                   │  Master Chain  │  │  Voice Pool    │
                   │                │  │  (32 voices)   │
                   └────────────────┘  └────────────────┘
                            │
                            ↓
              ┌──────────────────────────┐
              │  Master Effects Chain    │
              │  - Compressor            │
              │  - Limiter               │
              └──────────────────────────┘
                            │
                            ↓
                   ┌─────────────────┐
                   │  Destination    │
                   │  (Speakers/DAC) │
                   └─────────────────┘
```

### Pad Routing Architecture (8–16 Pads)

Each pad is an independent audio processing unit with its own signal chain:

```
┌────────────────────────────────────────────────────────────────┐
│                        PAD 1 - PAD 16                          │
└────────────────────────────────────────────────────────────────┘
         │                  │                  │
         ↓                  ↓                  ↓
    ┌────────┐        ┌────────┐        ┌────────┐
    │ Pad 1  │        │ Pad 2  │  ...   │ Pad 16 │
    │ Voice  │        │ Voice  │        │ Voice  │
    │ Pool   │        │ Pool   │        │ Pool   │
    └────────┘        └────────┘        └────────┘
         │                  │                  │
         ↓                  ↓                  ↓
    [Signal Chain]     [Signal Chain]    [Signal Chain]
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ↓
                   ┌────────────────┐
                   │  Master Mixer  │
                   │  (16 channels) │
                   └────────────────┘
                            │
                            ↓
                      [Master Chain]
                            │
                            ↓
                      [Destination]
```

### Detailed Node Graph

```
User Input (Keyboard/Mouse/MIDI)
         │
         ↓
┌─────────────────────┐
│  Event Handler      │
│  - Velocity         │
│  - Timing           │
└─────────────────────┘
         │
         ↓
┌─────────────────────┐
│  Voice Allocator    │
│  - Voice stealing   │
│  - Priority queue   │
└─────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│              Per-Pad Voice (1-32 active)                │
│                                                         │
│  ┌──────────────┐                                      │
│  │ Source Node  │  ← AudioBufferSourceNode             │
│  │ or           │     or                                │
│  │ Oscillator   │  ← OscillatorNode                    │
│  └──────────────┘                                      │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                      │
│  │ Gain Node    │  ← GainNode (velocity, envelope)    │
│  │ (Envelope)   │                                      │
│  └──────────────┘                                      │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                      │
│  │ Filter Node  │  ← BiquadFilterNode (lowpass, etc.) │
│  └──────────────┘                                      │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                      │
│  │ Panner Node  │  ← StereoPannerNode                 │
│  └──────────────┘                                      │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                      │
│  │ Effects Send │  ← GainNode (dry/wet mix)           │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────┐
│  Pad Mixer Bus      │  ← GainNode (pad volume)
└─────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│              Master Effects Chain                       │
│                                                         │
│  ┌──────────────┐     ┌──────────────┐                │
│  │ Master EQ    │  →  │ Compressor   │                │
│  └──────────────┘     └──────────────┘                │
│                              │                          │
│                              ↓                          │
│                      ┌──────────────┐                  │
│                      │ Limiter      │                  │
│                      └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────┐
│ Analyser Node       │  ← AnalyserNode (VU meters, FFT)
└─────────────────────┘
         │
         ↓
┌─────────────────────┐
│ Destination         │  ← AudioDestinationNode
└─────────────────────┘
```

---

## Latency Targets and Strategies

### Target Latency Breakdown

**End-to-End Latency Goal: < 10ms**

This target is critical for real-time musical performance where users can perceive latency above 10-15ms as noticeable delay.

### Latency Sources

1. **Input Latency**: Time from physical input to event handler
2. **Processing Latency**: Audio graph computation time
3. **Buffer Latency**: Audio buffer size effects
4. **Output Latency**: DAC and driver latency

### Strategies to Achieve Sub-10ms Latency

#### 1. AudioContext Configuration
```typescript
const audioContext = new AudioContext({
  latencyHint: 'interactive',  // Prioritizes low latency over power consumption
  sampleRate: 48000            // Standard pro-audio sample rate
});
```

**Impact**: 
- `latencyHint: 'interactive'` typically results in 128-256 sample buffers
- At 48kHz, 128 samples = 2.67ms, 256 samples = 5.33ms

#### 2. Buffer Size Optimization

**Recommended**: 128 samples (2.67ms at 48kHz)
**Maximum**: 256 samples (5.33ms at 48kHz)

```typescript
// Browser will use smallest buffer size available with 'interactive' hint
const baseLatency = audioContext.baseLatency;  // Typically 0.0027 - 0.0053 seconds
const outputLatency = audioContext.outputLatency; // Additional output latency
```

#### 3. Voice Pool Pre-allocation

**Strategy**: Pre-allocate and reuse audio nodes instead of creating on-demand

```typescript
class VoicePool {
  private voices: Voice[] = [];
  
  constructor(size: number = 32) {
    // Pre-allocate all voices at initialization
    for (let i = 0; i < size; i++) {
      this.voices.push(this.createVoice());
    }
  }
}
```

**Impact**: Eliminates node creation overhead (can be 5-10ms per node)

#### 4. Event Handler Optimization

```typescript
// Handle user input in the highest priority event handler
document.addEventListener('keydown', (event) => {
  // Trigger audio immediately - no async operations
  const voice = voicePool.allocate();
  voice.trigger(velocity, audioContext.currentTime);
}, { passive: false }); // Not passive for precise timing
```

**Impact**: Reduces input → audio trigger latency to < 1ms

#### 5. Minimize Audio Graph Complexity

- **Limit effects per pad**: 3-5 nodes max per voice
- **Use efficient nodes**: BiquadFilter > ConvolverNode
- **Avoid real-time FFT**: Only for visualization, not in audio path

#### 6. Worklet Consideration (Advanced)

For ultimate low-latency control:
```typescript
// AudioWorklet runs on separate high-priority thread
await audioContext.audioWorklet.addModule('sampler-processor.js');
const samplerNode = new AudioWorkletNode(audioContext, 'sampler-processor');
```

**Impact**: Can reduce processing latency by 1-2ms

---

## Per-Pad Signal Chain

### Signal Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Single Pad Signal Chain                   │
└──────────────────────────────────────────────────────────────┘

INPUT: Trigger Event (velocity, note, timestamp)
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE GENERATION                                        │
│                                                             │
│    Option A: Sample Playback                                │
│    ┌──────────────────────────────────┐                    │
│    │ AudioBufferSourceNode            │                    │
│    │ - Pre-loaded sample buffer       │                    │
│    │ - Playback rate (pitch shift)    │                    │
│    │ - Loop points                    │                    │
│    └──────────────────────────────────┘                    │
│                                                             │
│    Option B: Oscillator                                     │
│    ┌──────────────────────────────────┐                    │
│    │ OscillatorNode                   │                    │
│    │ - Type: sine/square/sawtooth/tri │                    │
│    │ - Frequency                       │                    │
│    │ - Detune                          │                    │
│    └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AMPLITUDE ENVELOPE                                       │
│    ┌──────────────────────────────────┐                    │
│    │ GainNode (Envelope)              │                    │
│    │ - Attack: 0-50ms                 │                    │
│    │ - Decay: 50-500ms                │                    │
│    │ - Sustain: 0-1.0                 │                    │
│    │ - Release: 50-2000ms             │                    │
│    │ - Velocity scaling               │                    │
│    └──────────────────────────────────┘                    │
│                                                             │
│    Implementation:                                          │
│    gainNode.gain.setValueAtTime(0, startTime);             │
│    gainNode.gain.linearRampToValueAtTime(                  │
│      velocity, startTime + attack                          │
│    );                                                       │
└─────────────────────────────────────────────────────────────┘
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FILTER                                                   │
│    ┌──────────────────────────────────┐                    │
│    │ BiquadFilterNode                 │                    │
│    │ - Type: lowpass (default)        │                    │
│    │ - Frequency: 20-20000 Hz         │                    │
│    │ - Q (resonance): 0.1-20          │                    │
│    │ - Optional envelope modulation   │                    │
│    └──────────────────────────────────┘                    │
│                                                             │
│    Common filter types per pad style:                       │
│    - Bass pads: lowpass (80-500Hz)                         │
│    - Lead pads: bandpass (500-5000Hz)                      │
│    - Hi-hat: highpass (8000-15000Hz)                       │
└─────────────────────────────────────────────────────────────┘
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. STEREO POSITIONING                                       │
│    ┌──────────────────────────────────┐                    │
│    │ StereoPannerNode                 │                    │
│    │ - Pan: -1.0 (left) to +1.0 (right)│                   │
│    │ - Equal-power panning             │                    │
│    └──────────────────────────────────┘                    │
│                                                             │
│    Strategic pan positions for 8 pads:                      │
│    Pad 1: -0.75 | Pad 2: -0.5 | Pad 3: -0.25 | Pad 4: 0   │
│    Pad 5: 0     | Pad 6: +0.25| Pad 7: +0.5  | Pad 8: +0.75│
└─────────────────────────────────────────────────────────────┘
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. EFFECTS CHAIN (Optional, per-pad)                       │
│    ┌──────────────────────────────────┐                    │
│    │ Effect 1: Waveshaper (Distortion)│                    │
│    │ - Drive amount                    │                    │
│    │ - Dry/wet mix                     │                    │
│    └──────────────────────────────────┘                    │
│                     ↓                                       │
│    ┌──────────────────────────────────┐                    │
│    │ Effect 2: Delay                   │                    │
│    │ - DelayNode + feedback            │                    │
│    │ - Time: 0-2000ms                  │                    │
│    │ - Feedback: 0-0.9                 │                    │
│    └──────────────────────────────────┘                    │
│                     ↓                                       │
│    ┌──────────────────────────────────┐                    │
│    │ Effect 3: Reverb                  │                    │
│    │ - ConvolverNode (impulse response)│                    │
│    │ - Room size                       │                    │
│    │ - Dry/wet mix                     │                    │
│    └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
   │
   ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PAD OUTPUT                                               │
│    ┌──────────────────────────────────┐                    │
│    │ GainNode (Pad Volume/Mute)       │                    │
│    │ - Volume: 0-1.0                   │                    │
│    │ - Mute: 0 or 1                    │                    │
│    │ - Solo support                    │                    │
│    └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
   │
   ↓
OUTPUT: → Master Mixer Bus
```

### Node Parameters and Ranges

#### Source (Sampler)
```typescript
interface SamplerConfig {
  buffer: AudioBuffer;           // Pre-loaded audio buffer
  playbackRate: number;          // 0.5-2.0 (pitch shift)
  loop: boolean;                 // true/false
  loopStart: number;             // seconds
  loopEnd: number;               // seconds
}
```

#### Source (Oscillator)
```typescript
interface OscillatorConfig {
  type: 'sine' | 'square' | 'sawtooth' | 'triangle';
  frequency: number;             // 20-20000 Hz
  detune: number;                // -1200 to +1200 cents
}
```

#### Envelope
```typescript
interface EnvelopeConfig {
  attack: number;                // 0-0.5 seconds
  decay: number;                 // 0-1.0 seconds
  sustain: number;               // 0-1.0 (amplitude)
  release: number;               // 0-5.0 seconds
}
```

#### Filter
```typescript
interface FilterConfig {
  type: BiquadFilterType;        // 'lowpass', 'highpass', 'bandpass', etc.
  frequency: number;             // 20-20000 Hz
  Q: number;                     // 0.0001-1000 (resonance)
  gain: number;                  // -40 to +40 dB (for peaking/shelf)
}
```

#### Effects
```typescript
interface EffectsConfig {
  distortion?: {
    drive: number;               // 0-100
    mix: number;                 // 0-1.0 (dry/wet)
  };
  delay?: {
    time: number;                // 0-2.0 seconds
    feedback: number;            // 0-0.95
    mix: number;                 // 0-1.0
  };
  reverb?: {
    impulseResponse: AudioBuffer; // IR buffer
    mix: number;                  // 0-1.0
  };
}
```

---

## Latency Budget Calculations

### Total Latency Budget: 10ms

Breaking down the end-to-end latency from user input to audio output:

```
┌──────────────────────────────────────────────────────────┐
│           Latency Component Breakdown                    │
└──────────────────────────────────────────────────────────┘

1. INPUT LATENCY
   ├─ Browser event dispatch              0.5 - 2.0 ms
   ├─ JavaScript event handler            0.1 - 0.5 ms
   └─ Voice allocation                    0.1 - 0.3 ms
   ────────────────────────────────────────────────────
   SUBTOTAL:                              0.7 - 2.8 ms

2. AUDIO PROCESSING LATENCY
   ├─ Node graph computation              0.5 - 1.5 ms
   ├─ Web Audio scheduling                0.1 - 0.3 ms
   └─ DSP processing overhead             0.2 - 0.5 ms
   ────────────────────────────────────────────────────
   SUBTOTAL:                              0.8 - 2.3 ms

3. BUFFER LATENCY (CONFIGURABLE)
   ├─ AudioContext buffer (128 samples)   2.67 ms @ 48kHz
   │                  (256 samples)        5.33 ms @ 48kHz
   ├─ Output buffer                       1.0 - 2.0 ms
   └─ Driver buffering                    0.5 - 1.5 ms
   ────────────────────────────────────────────────────
   SUBTOTAL:                              4.2 - 8.8 ms

4. OUTPUT LATENCY
   ├─ DAC conversion                      0.3 - 1.0 ms
   └─ Hardware propagation                0.1 - 0.5 ms
   ────────────────────────────────────────────────────
   SUBTOTAL:                              0.4 - 1.5 ms

────────────────────────────────────────────────────────
TOTAL END-TO-END LATENCY:                 6.1 - 15.4 ms
────────────────────────────────────────────────────────

TARGET CONFIGURATION (128 sample buffer):  ≈ 6-9 ms  ✓
FALLBACK CONFIGURATION (256 sample buffer): ≈ 9-15 ms ⚠️
```

### Optimization Strategies by Component

#### Input Latency (Target: < 1ms)
- Use passive: false for keyboard events (disables browser optimizations)
- Pre-allocate voices to eliminate allocation overhead
- Use requestAnimationFrame for UI updates, not audio triggers
- Consider PointerEvent API for touch/mouse with lower latency

#### Processing Latency (Target: < 2ms)
- Minimize node count per voice (< 10 nodes)
- Avoid expensive nodes: ConvolverNode (use sparingly)
- Pre-compute filter coefficients and envelopes
- Use OfflineAudioContext for non-real-time processing

#### Buffer Latency (Target: < 5ms)
- Request 'interactive' latency hint
- Monitor audioContext.baseLatency
- On low-power devices, may need to accept 256 samples
- Consider AudioWorklet for guaranteed low latency

#### Output Latency (Target: < 2ms)
- Use ASIO/WASAPI drivers on Windows (if available)
- CoreAudio on macOS (default, already optimized)
- Avoid Bluetooth audio (adds 100-200ms)
- Use wired headphones/speakers for minimum latency

### Measured Latency Targets

| Configuration | Expected Latency | Musical Acceptability |
|--------------|------------------|----------------------|
| Optimal (128 samples, 48kHz) | 6-9ms | Excellent - imperceptible |
| Good (256 samples, 48kHz) | 9-12ms | Good - barely noticeable |
| Acceptable (512 samples, 48kHz) | 15-20ms | Fair - noticeable but usable |
| Poor (1024 samples) | 30-40ms | Poor - significant delay |

### Runtime Monitoring

```typescript
// Monitor actual latency at runtime
class LatencyMonitor {
  checkLatency(audioContext: AudioContext): LatencyReport {
    const baseLatency = audioContext.baseLatency * 1000; // Convert to ms
    const outputLatency = audioContext.outputLatency * 1000;
    const totalAudioLatency = baseLatency + outputLatency;
    
    return {
      baseLatency,           // AudioContext processing latency
      outputLatency,         // Additional output/driver latency
      totalAudioLatency,     // Total (should be < 8ms for 128 samples)
      sampleRate: audioContext.sampleRate,
      state: audioContext.state
    };
  }
}
```

### Best and Worst Case Scenarios

**Best Case** (Modern desktop, 48kHz, 128 samples):
- Input: 0.7ms
- Processing: 0.8ms  
- Buffer: 4.2ms
- Output: 0.4ms
- **Total: ~6ms** ✓✓✓

**Worst Case** (Older hardware, 48kHz, 256 samples):
- Input: 2.8ms
- Processing: 2.3ms
- Buffer: 8.8ms
- Output: 1.5ms
- **Total: ~15ms** ⚠️

**Mitigation**: Adaptive buffer sizing based on device capabilities

---

## UI Component Map

### Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                         App (Root)                           │
│  - AudioContext management                                   │
│  - Global state                                              │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐  ┌─────────────────┐  ┌──────────────┐
│ ControlPanel  │  │   PadGrid       │  │ MasterMixer  │
│               │  │   (Main UI)     │  │              │
└───────────────┘  └─────────────────┘  └──────────────┘
        │                   │                   │
        │                   ├─────────┬─────────┤
        ↓                   ↓         ↓         ↓
┌───────────────┐      ┌──────┐ ┌──────┐   [16 pads...]
│ PlayControls  │      │ Pad  │ │ Pad  │
│ - Play/Stop   │      │  #1  │ │  #2  │
│ - BPM         │      └──────┘ └──────┘
│ - Metronome   │           │
└───────────────┘           ↓
        │            ┌──────────────┐
        ↓            │ PadControls  │
┌───────────────┐   │ - Volume     │
│ MasterEffects │   │ - Pan        │
│ - Compressor  │   │ - Filter     │
│ - Limiter     │   │ - Effects    │
│ - Reverb      │   │ - Sample     │
└───────────────┘   └──────────────┘
```

### Detailed Component Breakdown

#### 1. App Component
**Purpose**: Root component managing global audio state
```typescript
interface AppState {
  audioContext: AudioContext | null;
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  bpm: number;
  pads: PadState[];
}
```

#### 2. PadGrid Component
**Purpose**: Main interface displaying 8-16 pads in a grid layout

**Layout Options**:
- 8 pads: 4x2 grid
- 12 pads: 4x3 grid
- 16 pads: 4x4 grid

**Responsive Design**:
- Desktop: Full 4-column grid
- Tablet: 2-column grid
- Mobile: 1-column stacked list

```
┌─────────────────────────────────────────────┐
│              Pad Grid (4x4)                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Pad1 │ │ Pad2 │ │ Pad3 │ │ Pad4 │      │
│  │ 🔊   │ │ 🔊   │ │      │ │ 🔊   │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Pad5 │ │ Pad6 │ │ Pad7 │ │ Pad8 │      │
│  │      │ │ 🔊   │ │ 🔊   │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Pad9 │ │ Pad10│ │ Pad11│ │ Pad12│      │
│  │ 🔊   │ │      │ │ 🔊   │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Pad13│ │ Pad14│ │ Pad15│ │ Pad16│      │
│  │      │ │ 🔊   │ │      │ │ 🔊   │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
└─────────────────────────────────────────────┘
```

#### 3. Pad Component
**Purpose**: Individual pad with visual feedback and controls

**States**:
- Idle: Base color (from design system)
- Hover: Brightened color (+20% brightness)
- Active (playing): Pulsing animation
- Muted: Desaturated color

**Props**:
```typescript
interface PadProps {
  id: number;
  color: string;           // From 16-color palette
  label: string;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;          // 0-1
  pan: number;             // -1 to +1
  filterFreq: number;      // 20-20000
  onTrigger: () => void;
  onEdit: () => void;
}
```

**Visual Design**:
```
┌────────────────────────┐
│  Pad 1                 │ ← Label
│  ┌──────────────────┐  │
│  │                  │  │
│  │    KICK DRUM     │  │ ← Sample name
│  │                  │  │
│  │    ████████      │  │ ← Waveform preview
│  │                  │  │
│  └──────────────────┘  │
│  [Vol: 80%] [Pan: C]   │ ← Quick controls
│  Q key                 │ ← Keyboard shortcut
└────────────────────────┘
```

#### 4. PadControls Component (Drawer/Modal)
**Purpose**: Detailed parameter control for selected pad

**Sections**:
1. Source
   - Sample selection/upload
   - Oscillator type
   - Pitch/playback rate
   
2. Envelope
   - Attack slider (0-500ms)
   - Decay slider (0-1000ms)
   - Sustain slider (0-100%)
   - Release slider (0-5000ms)
   - Visual ADSR graph

3. Filter
   - Type dropdown
   - Frequency slider (20Hz-20kHz, logarithmic)
   - Resonance/Q slider
   - Filter envelope amount

4. Effects
   - Distortion: Drive + Mix
   - Delay: Time + Feedback + Mix
   - Reverb: Size + Mix

5. Output
   - Volume fader (0-100%)
   - Pan knob (-100% L to +100% R)
   - Mute/Solo buttons

#### 5. MasterMixer Component
**Purpose**: Global mix and master effects

**Controls**:
- Master volume fader
- Master peak meter (L/R)
- Compressor (threshold, ratio, attack, release)
- Limiter (ceiling, release)
- Master reverb send

#### 6. ControlPanel Component
**Purpose**: Transport and global settings

**Controls**:
```
┌─────────────────────────────────────────┐
│  [▶ Play] [⏸ Pause] [⏹ Stop]          │
│  BPM: [120] ± buttons                   │
│  Metronome: [ON/OFF] Volume: [50%]     │
│  Record: [⏺ REC] [Loop: ON]            │
└─────────────────────────────────────────┘
```

#### 7. Visualizer Component (Optional)
**Purpose**: Real-time audio visualization

**Types**:
- Waveform oscilloscope
- Frequency spectrum (FFT)
- Per-pad VU meters
- Master stereo meter

### Design System Sketch

#### Color Palette (EDM-Inspired Dark Theme)

**Background Colors**:
```css
--bg-primary: #0a0a0f;      /* Main background */
--bg-secondary: #1a1a24;    /* Elevated surfaces */
--bg-tertiary: #2a2a3a;     /* Controls, buttons */
```

**Accent Colors** (Primary):
```css
--accent-cyan: #00d9ff;     /* Primary actions, highlights */
--accent-magenta: #ff00ea;  /* Secondary actions, warnings */
--accent-yellow: #ffea00;   /* Alerts, metronome */
```

**16-Pad Color Palette**:
```css
/* Row 1 - Cool tones */
--pad-1: #00d9ff;  /* Cyan */
--pad-2: #00b8ff;  /* Sky blue */
--pad-3: #0088ff;  /* Ocean blue */
--pad-4: #4d00ff;  /* Electric blue */

/* Row 2 - Purple/Magenta */
--pad-5: #8000ff;  /* Purple */
--pad-6: #b000ff;  /* Violet */
--pad-7: #ff00ea;  /* Magenta */
--pad-8: #ff0099;  /* Hot pink */

/* Row 3 - Warm tones */
--pad-9: #ff0044;   /* Red */
--pad-10: #ff4400;  /* Orange-red */
--pad-11: #ff8800;  /* Orange */
--pad-12: #ffaa00;  /* Amber */

/* Row 4 - Yellow/Green */
--pad-13: #ffea00;  /* Yellow */
--pad-14: #ccff00;  /* Lime */
--pad-15: #88ff00;  /* Green-yellow */
--pad-16: #00ff88;  /* Mint */
```

**Grayscale** (Text and UI elements):
```css
--text-primary: #ffffff;    /* Primary text */
--text-secondary: #a0a0b0;  /* Secondary text */
--text-muted: #606070;      /* Disabled text */
--border: #3a3a4a;          /* Borders, dividers */
```

#### Typography

```css
/* Font stack */
--font-primary: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;   /* 12px - Labels */
--text-sm: 0.875rem;  /* 14px - Body */
--text-base: 1rem;    /* 16px - Default */
--text-lg: 1.25rem;   /* 20px - Headings */
--text-xl: 1.5rem;    /* 24px - Large headings */
--text-2xl: 2rem;     /* 32px - Display */
```

#### Spacing System

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

#### Component Styles

**Pad Button**:
```css
.pad {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: var(--pad-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
  cursor: pointer;
}

.pad:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 217, 255, 0.4);
  filter: brightness(1.2);
}

.pad:active {
  transform: scale(0.95);
}

.pad.playing {
  animation: pulse 0.5s ease-in-out;
  box-shadow: 0 0 30px var(--pad-color);
}
```

**Slider/Fader**:
```css
.slider {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  position: relative;
}

.slider-track {
  height: 100%;
  background: var(--accent-cyan);
  border-radius: 2px;
}

.slider-thumb {
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: grab;
}

.slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}
```

**Button Styles**:
```css
.button-primary {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.button-primary:hover {
  background: #00eaff;
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.4);
}

.button-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

#### Animations

```css
/* Pulse animation for playing pads */
@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 30px var(--pad-color);
  }
}

/* Peak meter animation */
@keyframes meter-peak {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Layout Grid

```
Desktop (>1024px):
┌────────────────────────────────────────────────────────┐
│  ControlPanel (Top bar - 60px height)                 │
├─────────────┬────────────────────────┬─────────────────┤
│ Sidebar     │  PadGrid (4x4)        │  MasterMixer   │
│ (240px)     │  (flex-grow)          │  (280px)       │
│             │                        │                │
│ - Presets   │  Main interaction      │  - Meters      │
│ - Settings  │  area                  │  - Master FX   │
│ - Help      │                        │  - Export      │
└─────────────┴────────────────────────┴─────────────────┘

Tablet (768-1024px):
┌────────────────────────────────────────────────────────┐
│  ControlPanel (Top bar)                               │
├────────────────────────────────────────────────────────┤
│  PadGrid (2x4 or 3x3)                                 │
│  (Full width)                                         │
├────────────────────────────────────────────────────────┤
│  MasterMixer (Bottom drawer - collapsible)            │
└────────────────────────────────────────────────────────┘

Mobile (<768px):
┌────────────────┐
│ ControlPanel   │ ← Hamburger menu
├────────────────┤
│ PadGrid (2x2)  │
│ Scrollable     │
├────────────────┤
│ Quick Controls │ ← Swipe up drawer
└────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Core Audio Engine (Weeks 1-2)
- [ ] AudioContext initialization with 'interactive' latency
- [ ] Voice pool implementation (32 voices)
- [ ] Basic sample playback (AudioBufferSourceNode)
- [ ] Envelope generator (ADSR)
- [ ] Pad trigger system with keyboard input
- [ ] Latency monitoring and reporting

### Phase 2: Signal Processing (Weeks 3-4)
- [ ] BiquadFilter implementation per pad
- [ ] StereoPanner for spatial positioning
- [ ] Master mixer bus (16 channels)
- [ ] Master compressor/limiter
- [ ] Basic effects: distortion, delay

### Phase 3: UI Components (Weeks 5-6)
- [ ] PadGrid component with 4x4 layout
- [ ] Pad component with visual feedback
- [ ] PadControls drawer/modal
- [ ] Master mixer UI
- [ ] Control panel with transport

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Sample upload and management
- [ ] Preset system (save/load pad configurations)
- [ ] MIDI input support
- [ ] Audio recording/export
- [ ] Advanced effects: reverb (ConvolverNode)

### Phase 5: Optimization & Polish (Weeks 9-10)
- [ ] Performance profiling and optimization
- [ ] Latency tuning and testing
- [ ] Responsive design refinement
- [ ] Accessibility improvements (keyboard nav, screen readers)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Phase 6: Testing & Documentation (Weeks 11-12)
- [ ] Unit tests for audio engine components
- [ ] Integration tests for UI components
- [ ] E2E tests for complete user workflows
- [ ] Performance benchmarks
- [ ] User documentation and tutorials

---

## Technical Specifications

### Browser Compatibility

**Minimum Requirements**:
- Chrome 66+ (Web Audio API with AudioWorklet)
- Firefox 76+ (Web Audio API support)
- Safari 14.1+ (Web Audio API improvements)
- Edge 79+ (Chromium-based)

**Progressive Enhancement**:
- Detect AudioWorklet support, fallback to ScriptProcessor
- Detect AnalyserNode support for visualizations
- Handle browser-specific sample rate limitations

### Performance Targets

- **CPU Usage**: < 30% on single core (for 16 active pads)
- **Memory Usage**: < 100 MB (including loaded samples)
- **Sample Loading**: < 500ms for 16 samples (1MB total)
- **UI Responsiveness**: 60 FPS during audio playback
- **Cold Start**: < 2 seconds to first sound

### Audio Quality Specifications

- **Sample Rate**: 48000 Hz (standard, fallback to 44100 Hz)
- **Bit Depth**: 32-bit float (native Web Audio)
- **Dynamic Range**: > 90 dB (16-bit equivalent)
- **THD+N**: < 0.01% (total harmonic distortion + noise)
- **Frequency Response**: 20 Hz - 20 kHz (±0.5 dB)

---

## Conclusion

This blueprint provides a comprehensive architecture for a professional real-time audio engine supporting 8-16 pads with sub-10ms latency. Key innovations include:

1. **Voice pool pre-allocation** for zero-latency voice allocation
2. **Optimized audio graph** with minimal node count per voice
3. **Interactive latency hint** for smallest possible buffer sizes
4. **Comprehensive signal chain** with professional-grade processing
5. **Modern UI design** with responsive layout and visual feedback

The architecture is designed to scale from simple sampler functionality to a full-featured DAW-like experience, while maintaining the critical sub-10ms latency requirement for real-time performance.

### Next Steps

1. Review this blueprint with stakeholders
2. Prioritize features for MVP (Minimum Viable Product)
3. Set up development environment and tooling
4. Begin Phase 1 implementation (Core Audio Engine)
5. Establish testing and CI/CD pipeline

### References

- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [MDN Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Best Practices](https://developer.chrome.com/blog/audio-scheduling/)
- [Low-Latency Audio on the Web](https://www.html5rocks.com/en/tutorials/webaudio/intro/)
