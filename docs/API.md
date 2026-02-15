# API Usage Guide

## Core Engine API

### AudioEngine

The `AudioEngine` class manages the Web Audio context and sound playback.

#### Initialization

```typescript
import { AudioEngine } from '@looppad/core';

const engine = new AudioEngine({
  sampleRate: 44100,
  latency: 'interactive',
  maxVoices: 32,
  bufferSize: 128,
});

// Must be called in response to user interaction
await engine.initialize();
```

#### Loading Samples

```typescript
import type { Sample } from '@looppad/core';

const sample: Sample = {
  id: 'kick-01',
  name: 'Kick Drum',
  url: '/sounds/kick.wav',
  duration: 0.5,
  sampleRate: 44100,
};

await engine.loadSample(sample);
```

#### Registering Instruments

```typescript
import type { Instrument } from '@looppad/core';
import { generateId } from '@looppad/core';

const instrument: Instrument = {
  id: generateId(),
  name: 'Kick',
  sampleId: 'kick-01',
  volume: 0.8,
  pan: 0,
  pitch: 0,
  attack: 0.001,
  decay: 0.1,
  sustain: 0.7,
  release: 0.2,
  reverb: 0.3,
  delay: 0,
  filter: {
    type: 'lowpass',
    frequency: 2000,
    q: 1.0,
  },
};

engine.registerInstrument(instrument);
```

#### Triggering Sounds

```typescript
// Trigger immediately
const voiceId = engine.trigger(instrument.id, 1.0);

// Schedule for future playback
const scheduledTime = engine.getCurrentTime() + 0.5;
engine.trigger(instrument.id, 0.8, scheduledTime);
```

#### Stopping Sounds

```typescript
// Stop specific voice
engine.stopVoice(voiceId);

// Stop all voices
engine.stopAll();
```

### Transport

The `Transport` class handles playback timing and quantization.

#### Basic Usage

```typescript
import { Transport } from '@looppad/core';

const transport = new Transport(engine, 120); // 120 BPM

// Start playback
transport.start();

// Change tempo
transport.setTempo(140);

// Stop playback
transport.stop();

// Pause (maintains position)
transport.pause();
```

#### Quantization

```typescript
// Quantize time to nearest 16th note
const quantizedTime = transport.quantizeTime(time, 16);

// Quantize to 8th notes
const quantizedTime8th = transport.quantizeTime(time, 8);
```

#### Pattern Playback

```typescript
import type { Pattern } from '@looppad/core';

const pattern: Pattern = {
  id: generateId(),
  name: 'Beat 1',
  length: 4, // 4 beats
  resolution: 16, // 16th notes
  steps: [
    {
      index: 0,
      triggers: [
        {
          padId: 'pad-0',
          velocity: 1.0,
          offset: 0,
        },
      ],
    },
    // ... more steps
  ],
};

transport.setPattern(pattern);
transport.start();
```

### VoicePool

The `VoicePool` manages polyphonic voice allocation.

#### Configuration

```typescript
import { VoicePool } from '@looppad/core';

const voicePool = new VoicePool({
  maxVoices: 32,
  stealingStrategy: 'oldest', // 'oldest' | 'quietest' | 'nearest-release'
});
```

#### Voice Management

```typescript
// Allocate a voice
const voiceId = voicePool.allocate(priority);

// Release a voice
voicePool.release(voiceId);

// Check status
const activeCount = voicePool.getActiveCount();
const hasAvailable = voicePool.hasAvailable();

// Reset all voices
voicePool.reset();
```

### SoundLoader

The `SoundLoader` handles asset loading with caching.

#### Configuration

```typescript
import { SoundLoader } from '@looppad/core';

const loader = new SoundLoader({
  cacheEnabled: true,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  cloudEndpoint: 'https://api.looppad.io/sounds',
});
```

#### Loading Samples

```typescript
// Load single sample
const arrayBuffer = await loader.loadSample(sample);

// Load entire sound pack
await loader.loadSoundPack(soundPack);

// Preload for offline use
await loader.preloadForOffline(samples);
```

#### Cache Management

```typescript
// Get cache size
const size = loader.getCacheSize();

// Clear cache
loader.clearCache();
```

## UI Components (React)

### PadGrid

```typescript
import { PadGrid } from '@looppad/web';

<PadGrid
  padCount={16}
  onPadTrigger={(index, velocity) => {
    engine.trigger(instruments[index].id, velocity);
  }}
  activePads={activePads}
/>
```

### Transport

```typescript
import { Transport } from '@looppad/web';

<Transport
  playing={playing}
  recording={recording}
  tempo={tempo}
  onPlay={() => transport.start()}
  onStop={() => transport.stop()}
  onRecord={() => setRecording(!recording)}
  onTempoChange={(bpm) => transport.setTempo(bpm)}
/>
```

### SoundPackSelector

```typescript
import { SoundPackSelector } from '@looppad/web';

<SoundPackSelector
  packs={soundPacks}
  selectedPackId={selectedPackId}
  onSelectPack={(id) => {
    setSelectedPackId(id);
    // Load sound pack
  }}
/>
```

## Utility Functions

### ID Generation

```typescript
import { generateId } from '@looppad/core';

const id = generateId(); // UUID v4
```

### Audio Utilities

```typescript
import {
  clamp,
  lerp,
  midiToFreq,
  freqToMidi,
  dbToGain,
  gainToDb,
  formatTime,
  isWebAudioSupported,
} from '@looppad/core';

// Clamp value to range
const clamped = clamp(value, 0, 1);

// Linear interpolation
const interpolated = lerp(0, 100, 0.5); // 50

// MIDI conversion
const freq = midiToFreq(69); // 440 Hz (A4)
const midi = freqToMidi(440); // 69

// Decibel conversion
const gain = dbToGain(-6); // ~0.5
const db = gainToDb(0.5); // ~-6

// Time formatting
const formatted = formatTime(65.5); // "01:05.50"

// Feature detection
if (isWebAudioSupported()) {
  // Initialize audio engine
}
```

## Complete Example

```typescript
import {
  AudioEngine,
  Transport,
  SoundLoader,
  generateId,
  type Sample,
  type Instrument,
  type SoundPack,
} from '@looppad/core';

async function initLoopPad() {
  // Initialize engine
  const engine = new AudioEngine({
    maxVoices: 32,
    latency: 'interactive',
  });
  await engine.initialize();

  // Create loader
  const loader = new SoundLoader();

  // Load sound pack
  const soundPack: SoundPack = {
    id: generateId(),
    name: '808 Kit',
    // ... other properties
    samples: [
      {
        id: 'kick-01',
        name: 'Kick',
        url: '/sounds/808-kick.wav',
        duration: 0.5,
        sampleRate: 44100,
      },
    ],
    instruments: [],
    storageType: 'local',
    lastModified: new Date(),
    size: 0,
  };

  await loader.loadSoundPack(soundPack);

  // Create and register instrument
  const instrument: Instrument = {
    id: generateId(),
    name: 'Kick',
    sampleId: 'kick-01',
    volume: 0.8,
    pan: 0,
    pitch: 0,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    reverb: 0,
    delay: 0,
    filter: null,
  };

  engine.registerInstrument(instrument);

  // Create transport
  const transport = new Transport(engine, 120);

  // Trigger sound
  engine.trigger(instrument.id, 1.0);

  // Start playback
  transport.start();
}
```

## Error Handling

```typescript
try {
  await engine.initialize();
} catch (error) {
  console.error('Failed to initialize audio engine:', error);
  // Show error to user
}

try {
  await loader.loadSample(sample);
} catch (error) {
  console.error('Failed to load sample:', error);
  // Fallback to alternative sample or show error
}
```

## Performance Tips

1. **Preload samples** before playback starts
2. **Reuse instruments** instead of creating new ones
3. **Limit active voices** with VoicePool
4. **Use quantization** to reduce CPU usage
5. **Clear cache** periodically to manage memory
6. **Dispose engine** when no longer needed

```typescript
// Cleanup
await engine.dispose();
loader.clearCache();
```
