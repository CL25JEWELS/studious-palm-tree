# Code Examples

## Basic Setup

### Initialize Audio Engine

```typescript
import { AudioEngine, PadController, Transport } from '@echoforge/core';
import type { Instrument } from '@echoforge/shared-types';

// Create instances
const audioEngine = new AudioEngine();
const padController = new PadController();
const transport = new Transport();

// Initialize audio engine
await audioEngine.initialize();
console.log('Audio latency:', audioEngine.getLatency(), 'ms');
```

### Create and Configure Pads

```typescript
// Create a pad
const pad = padController.createPad({
  instrumentId: 'kick-drum',
  volume: 0.8,
  pitch: 0,
  pan: 0,
  playbackMode: 'oneShot',
  color: '#2196f3',
});

// Register pad with audio engine
audioEngine.registerPad(pad);

// Update pad parameters
padController.updatePad(pad.id, {
  volume: 0.6,
  pitch: 2,
});
```

### Load Instruments

```typescript
const instrument: Instrument = {
  id: 'kick-drum',
  name: 'Kick Drum',
  type: 'sampler',
  soundPackId: 'edm-kit',
  settings: {
    type: 'sampler',
    source: '/audio/kick.wav',
    format: 'wav',
    sampleRate: 48000,
    attackTime: 0.01,
    releaseTime: 0.5,
  },
};

await audioEngine.loadInstrument(instrument);
```

### Trigger Pads

```typescript
// Trigger a pad
audioEngine.triggerPad(pad.id, 0.8); // velocity 0.8

// Stop a pad
audioEngine.stopPad(pad.id);

// With event handler
padButton.addEventListener('click', () => {
  audioEngine.triggerPad(pad.id);
});
```

### Transport Controls

```typescript
// Set BPM
transport.setBPM(128);

// Set time signature
transport.setTimeSignature(4, 4);

// Start playback
transport.start();

// Listen to beat events
transport.on('beat', () => {
  console.log('Beat!');
});

// Listen to measure events
transport.on('measure', () => {
  console.log('Measure complete');
});

// Stop playback
transport.stop();
```

### Subscribe to Pad Changes

```typescript
// Subscribe to pad state changes
const unsubscribe = padController.subscribe((pads) => {
  console.log('Pads updated:', pads.length);
  // Update UI
});

// Unsubscribe when done
unsubscribe();
```

## React Integration

### Basic Hook Usage

```typescript
import { useEffect, useState } from 'react';
import { AudioEngine, PadController } from '@echoforge/core';
import type { PadState } from '@echoforge/shared-types';

function usePads() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [padController] = useState(() => new PadController());
  const [pads, setPads] = useState<PadState[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize
    audioEngine.initialize().then(() => {
      setIsInitialized(true);
    });

    // Subscribe to updates
    const unsubscribe = padController.subscribe(setPads);

    // Cleanup
    return () => {
      unsubscribe();
      audioEngine.dispose();
    };
  }, [audioEngine, padController]);

  const triggerPad = (padId: string) => {
    if (isInitialized) {
      audioEngine.triggerPad(padId);
    }
  };

  return { pads, triggerPad, isInitialized };
}
```

### Using UI Components

```typescript
import { PadGrid, TransportBar, PadControls } from '@echoforge/ui';

function App() {
  const { pads, triggerPad, isInitialized } = usePads();
  const [selectedPad, setSelectedPad] = useState<PadState | null>(null);

  return (
    <div>
      <TransportBar
        state="stopped"
        bpm={120}
        onPlay={() => transport.start()}
        onStop={() => transport.stop()}
        onPause={() => transport.pause()}
        onBPMChange={(bpm) => transport.setBPM(bpm)}
      />

      <PadGrid
        pads={pads}
        columns={4}
        onTriggerPad={(padId) => {
          triggerPad(padId);
          setSelectedPad(pads.find((p) => p.id === padId) || null);
        }}
      />

      {selectedPad && (
        <PadControls
          pad={selectedPad}
          onUpdate={(padId, updates) => {
            padController.updatePad(padId, updates);
            audioEngine.updatePadState(padId, updates);
          }}
        />
      )}
    </div>
  );
}
```

## Project Management

### Create and Save Project

```typescript
import { ProjectManager } from '@echoforge/core';

const projectManager = new ProjectManager();

// Create new project
const project = await projectManager.createProject({
  name: 'My First Track',
  author: 'Producer Name',
  bpm: 128,
  signature: { numerator: 4, denominator: 4 },
  pads: padController.getAllPads(),
  soundPackIds: ['edm-kit'],
  metadata: {
    tags: ['edm', 'house'],
    isPublic: false,
  },
});

// Save project
await projectManager.saveProject(project);

// Load project
const loadedProject = await projectManager.loadProject(project.id);
```

### Export Project

```typescript
// Export as JSON
const jsonBlob = await projectManager.exportProject(project.id, 'json');

// Download
const url = URL.createObjectURL(jsonBlob);
const a = document.createElement('a');
a.href = url;
a.download = `${project.name}.json`;
a.click();
```

### Import Project

```typescript
// Import from file
const file = event.target.files[0];
const project = await projectManager.importProject(file);

// Restore project state
project.pads.forEach((pad) => {
  const created = padController.createPad(pad);
  audioEngine.registerPad(created);
});

transport.setBPM(project.bpm);
```

## Advanced Usage

### Custom Effects Chain

```typescript
// Create effect instance
const reverbEffect: EffectInstance = {
  id: 'reverb-1',
  type: 'reverb',
  settings: {
    type: 'reverb',
    decay: 2.5,
    preDelay: 0.02,
    wetDryMix: 0.3,
  },
  bypass: false,
};

// Add to project
project.effects.push(reverbEffect);

// Assign to pad
padController.updatePad(pad.id, {
  effectsChain: [reverbEffect.id],
});
```

### Quantization

```typescript
// Enable quantization
transport.setQuantization(true);

// Schedule pad trigger on next beat
const now = transport.getCurrentTime();
const nextBeat = transport.quantizeTime(now);

transport.scheduleAt(nextBeat, () => {
  audioEngine.triggerPad(pad.id);
});
```

### Recording Sequence

```typescript
import type { NoteSequence } from '@echoforge/shared-types';

const sequence: NoteSequence = {
  notes: [
    { time: 0.0, duration: 0.5, velocity: 0.8 },
    { time: 0.5, duration: 0.5, velocity: 0.6 },
    { time: 1.0, duration: 0.5, velocity: 0.9 },
    { time: 1.5, duration: 0.5, velocity: 0.7 },
  ],
  length: 2.0, // 2 seconds
};

// Assign to pad
padController.updatePad(pad.id, {
  recordedSequence: sequence,
  playbackMode: 'loop',
});

// Play sequence
transport.on('beat', () => {
  const currentTime = transport.getCurrentTime() % sequence.length;
  const note = sequence.notes.find(
    (n) => n.time <= currentTime && n.time + n.duration > currentTime
  );
  if (note) {
    audioEngine.triggerPad(pad.id, note.velocity);
  }
});
```

### Error Handling

```typescript
import {
  AudioEngineError,
  InstrumentLoadError,
  PadNotFoundError,
} from '@echoforge/shared-types';

try {
  await audioEngine.loadInstrument(instrument);
} catch (error) {
  if (error instanceof InstrumentLoadError) {
    console.error('Failed to load instrument:', error.instrumentId);
  } else if (error instanceof AudioEngineError) {
    console.error('Audio engine error:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}

try {
  audioEngine.triggerPad('invalid-pad-id');
} catch (error) {
  if (error instanceof PadNotFoundError) {
    console.error('Pad not found:', error.padId);
  }
}
```

## Performance Optimization

### Preload Instruments

```typescript
// Preload all instruments at startup
const instruments = soundPack.instruments;
await Promise.all(
  instruments.map((instrument) => audioEngine.loadInstrument(instrument))
);
```

### Lazy Load Sound Packs

```typescript
async function loadSoundPack(packId: string) {
  const pack = await fetch(`/api/sound-packs/${packId}`).then((r) => r.json());

  // Load instruments on demand
  for (const instrument of pack.instruments) {
    await audioEngine.loadInstrument(instrument);
  }

  return pack;
}
```

### Memoize Calculations

```typescript
import { useMemo } from 'react';

function PadGridOptimized({ pads }: { pads: PadState[] }) {
  const activePads = useMemo(() => pads.filter((p) => p.isActive), [pads]);

  const gridLayout = useMemo(
    () => ({
      columns: Math.ceil(Math.sqrt(pads.length)),
      rows: Math.ceil(pads.length / Math.ceil(Math.sqrt(pads.length))),
    }),
    [pads.length]
  );

  return (
    <div style={{ gridTemplateColumns: `repeat(${gridLayout.columns}, 1fr)` }}>
      {activePads.map((pad) => (
        <PadButton key={pad.id} pad={pad} onTrigger={handleTrigger} />
      ))}
    </div>
  );
}
```

## Testing Examples

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { PadController } from '@echoforge/core';

describe('PadController', () => {
  it('should create pad with default values', () => {
    const controller = new PadController();
    const pad = controller.createPad({});

    expect(pad.volume).toBe(0.8);
    expect(pad.isActive).toBe(true);
    expect(pad.playbackMode).toBe('oneShot');
  });

  it('should update pad properties', () => {
    const controller = new PadController();
    const pad = controller.createPad({});

    controller.updatePad(pad.id, { volume: 0.5 });

    const updated = controller.getPad(pad.id);
    expect(updated?.volume).toBe(0.5);
  });
});
```

### React Component Test

```typescript
import { render, fireEvent } from '@testing-library/react';
import { PadButton } from '@echoforge/ui';

describe('PadButton', () => {
  it('should trigger pad on click', () => {
    const handleTrigger = vi.fn();
    const pad = { id: 'pad-1', isActive: true, isMuted: false };

    const { getByRole } = render(
      <PadButton pad={pad} onTrigger={handleTrigger} />
    );

    fireEvent.click(getByRole('button'));

    expect(handleTrigger).toHaveBeenCalledWith('pad-1');
  });
});
```
