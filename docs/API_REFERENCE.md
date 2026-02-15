# EchoForge API Reference

Complete API documentation for EchoForge core modules.

## Table of Contents

1. [AudioEngine](#audioengine)
2. [PadController](#padcontroller)
3. [Transport](#transport)
4. [ProjectManager](#projectmanager)
5. [Type Definitions](#type-definitions)
6. [Error Handling](#error-handling)

---

## AudioEngine

The core audio processing engine using Web Audio API.

### Constructor

```typescript
const audioEngine = new AudioEngine();
```

### Methods

#### `initialize(): Promise<void>`

Initializes the audio context and engine.

**Throws**: `AudioEngineError` if initialization fails

**Example**:
```typescript
await audioEngine.initialize();
```

---

#### `loadInstrument(instrument: Instrument): Promise<string>`

Loads an instrument into the engine.

**Parameters**:
- `instrument`: Instrument configuration

**Returns**: Loaded instrument ID

**Throws**: `InstrumentLoadError` if loading fails

**Example**:
```typescript
const instrument: Instrument = {
  id: 'kick',
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

const id = await audioEngine.loadInstrument(instrument);
```

---

#### `triggerPad(padId: string, velocity?: number): void`

Triggers a pad to play.

**Parameters**:
- `padId`: Pad identifier
- `velocity`: Note velocity (0..1), default: 1

**Throws**: `PadNotFoundError` if pad doesn't exist

**Example**:
```typescript
audioEngine.triggerPad('pad_123', 0.8);
```

---

#### `stopPad(padId: string): void`

Stops a playing pad.

**Parameters**:
- `padId`: Pad identifier

**Example**:
```typescript
audioEngine.stopPad('pad_123');
```

---

#### `updatePadState(padId: string, updates: Partial<PadState>): void`

Updates pad parameters in real-time.

**Parameters**:
- `padId`: Pad identifier
- `updates`: Partial pad state updates

**Example**:
```typescript
audioEngine.updatePadState('pad_123', {
  volume: 0.6,
  pitch: 2,
  pan: -0.5,
});
```

---

#### `setMasterVolume(volume: number): void`

Sets master output volume.

**Parameters**:
- `volume`: Volume level (0..1)

**Example**:
```typescript
audioEngine.setMasterVolume(0.8);
```

---

#### `getLatency(): number`

Gets current audio latency.

**Returns**: Latency in milliseconds

**Example**:
```typescript
const latency = audioEngine.getLatency();
console.log('Latency:', latency, 'ms');
```

---

#### `dispose(): void`

Cleans up and releases audio resources.

**Example**:
```typescript
audioEngine.dispose();
```

---

#### `registerPad(pad: PadState): void`

Registers a pad with the audio engine (internal method).

**Parameters**:
- `pad`: Pad state to register

---

#### `unregisterPad(padId: string): void`

Unregisters a pad from the audio engine (internal method).

**Parameters**:
- `padId`: Pad identifier

---

## PadController

Manages pad state and routing.

### Constructor

```typescript
const padController = new PadController();
```

### Methods

#### `createPad(config: Partial<PadState>): PadState`

Creates a new pad.

**Parameters**:
- `config`: Initial pad configuration

**Returns**: Created pad state

**Example**:
```typescript
const pad = padController.createPad({
  instrumentId: 'kick',
  volume: 0.8,
  pitch: 0,
  playbackMode: 'oneShot',
});
```

---

#### `getPad(padId: string): PadState | null`

Gets a pad by ID.

**Parameters**:
- `padId`: Pad identifier

**Returns**: Pad state or null if not found

**Example**:
```typescript
const pad = padController.getPad('pad_123');
if (pad) {
  console.log('Volume:', pad.volume);
}
```

---

#### `updatePad(padId: string, updates: Partial<PadState>): void`

Updates pad state.

**Parameters**:
- `padId`: Pad identifier
- `updates`: Partial pad state updates

**Throws**: Error if pad not found

**Example**:
```typescript
padController.updatePad('pad_123', {
  volume: 0.5,
  isMuted: true,
});
```

---

#### `deletePad(padId: string): void`

Deletes a pad.

**Parameters**:
- `padId`: Pad identifier

**Example**:
```typescript
padController.deletePad('pad_123');
```

---

#### `getAllPads(): PadState[]`

Gets all pads.

**Returns**: Array of all pad states

**Example**:
```typescript
const pads = padController.getAllPads();
console.log('Total pads:', pads.length);
```

---

#### `subscribe(callback: (pads: PadState[]) => void): () => void`

Subscribes to pad state changes.

**Parameters**:
- `callback`: Function called on state change

**Returns**: Unsubscribe function

**Example**:
```typescript
const unsubscribe = padController.subscribe((pads) => {
  console.log('Pads updated:', pads);
});

// Later...
unsubscribe();
```

---

## Transport

Controls playback timing and synchronization.

### Constructor

```typescript
const transport = new Transport();
```

### Methods

#### `start(): void`

Starts playback.

**Example**:
```typescript
transport.start();
```

---

#### `stop(): void`

Stops playback and resets position.

**Example**:
```typescript
transport.stop();
```

---

#### `pause(): void`

Pauses playback (maintains position).

**Example**:
```typescript
transport.pause();
```

---

#### `getState(): TransportState`

Gets current playback state.

**Returns**: 'playing' | 'stopped' | 'paused'

**Example**:
```typescript
const state = transport.getState();
console.log('Transport state:', state);
```

---

#### `setBPM(bpm: number): void`

Sets tempo.

**Parameters**:
- `bpm`: Beats per minute (60..300)

**Throws**: Error if BPM out of range

**Example**:
```typescript
transport.setBPM(128);
```

---

#### `getBPM(): number`

Gets current tempo.

**Returns**: Beats per minute

**Example**:
```typescript
const bpm = transport.getBPM();
```

---

#### `setTimeSignature(numerator: number, denominator: number): void`

Sets time signature.

**Parameters**:
- `numerator`: Beat count per measure
- `denominator`: Beat note value

**Example**:
```typescript
transport.setTimeSignature(3, 4); // 3/4 time
```

---

#### `getCurrentTime(): number`

Gets current playback position.

**Returns**: Position in seconds

**Example**:
```typescript
const time = transport.getCurrentTime();
```

---

#### `scheduleAt(time: number, callback: () => void): void`

Schedules an event at a specific time.

**Parameters**:
- `time`: Time in seconds
- `callback`: Function to execute

**Example**:
```typescript
transport.scheduleAt(4.0, () => {
  console.log('4 seconds elapsed');
});
```

---

#### `setQuantization(enabled: boolean): void`

Enables/disables quantization.

**Parameters**:
- `enabled`: Quantization state

**Example**:
```typescript
transport.setQuantization(true);
```

---

#### `on(event: TransportEvent, callback: () => void): void`

Subscribes to transport events.

**Parameters**:
- `event`: Event type ('start' | 'stop' | 'pause' | 'beat' | 'measure')
- `callback`: Event handler

**Example**:
```typescript
transport.on('beat', () => {
  console.log('Beat');
});

transport.on('measure', () => {
  console.log('Measure complete');
});
```

---

#### `getBeatDuration(): number`

Gets the duration of one beat in seconds.

**Returns**: Beat duration

**Example**:
```typescript
const beatDuration = transport.getBeatDuration();
```

---

#### `getMeasureDuration(): number`

Gets the duration of one measure in seconds.

**Returns**: Measure duration

**Example**:
```typescript
const measureDuration = transport.getMeasureDuration();
```

---

#### `quantizeTime(time: number): number`

Quantizes a time to the nearest beat.

**Parameters**:
- `time`: Time to quantize

**Returns**: Quantized time

**Example**:
```typescript
const quantized = transport.quantizeTime(0.7);
```

---

## ProjectManager

Handles project persistence and synchronization.

### Constructor

```typescript
const projectManager = new ProjectManager();
```

### Methods

#### `createProject(config: Partial<Project>): Promise<Project>`

Creates a new project.

**Parameters**:
- `config`: Initial project configuration

**Returns**: Created project

**Example**:
```typescript
const project = await projectManager.createProject({
  name: 'My Track',
  author: 'Producer',
  bpm: 128,
  pads: padController.getAllPads(),
});
```

---

#### `loadProject(projectId: string): Promise<Project | null>`

Loads a project by ID.

**Parameters**:
- `projectId`: Project identifier

**Returns**: Project or null if not found

**Throws**: `ProjectLoadError` if loading fails

**Example**:
```typescript
const project = await projectManager.loadProject('project_123');
```

---

#### `saveProject(project: Project): Promise<void>`

Saves a project.

**Parameters**:
- `project`: Project to save

**Throws**: `ProjectSaveError` if saving fails

**Example**:
```typescript
await projectManager.saveProject(project);
```

---

#### `exportProject(projectId: string, format: 'json' | 'wav' | 'mp3'): Promise<Blob>`

Exports a project to file.

**Parameters**:
- `projectId`: Project identifier
- `format`: Export format

**Returns**: Blob containing exported data

**Example**:
```typescript
const blob = await projectManager.exportProject('project_123', 'json');
```

---

#### `importProject(data: Blob): Promise<Project>`

Imports a project from file.

**Parameters**:
- `data`: Project data blob

**Returns**: Imported project

**Throws**: `ProjectImportError` if import fails

**Example**:
```typescript
const file = event.target.files[0];
const project = await projectManager.importProject(file);
```

---

#### `listProjects(): Promise<ProjectMetadata[]>`

Lists all projects.

**Returns**: Array of project metadata

**Example**:
```typescript
const projects = await projectManager.listProjects();
```

---

#### `deleteProject(projectId: string): Promise<void>`

Deletes a project.

**Parameters**:
- `projectId`: Project identifier

**Example**:
```typescript
await projectManager.deleteProject('project_123');
```

---

#### `syncToCloud(projectId: string): Promise<void>`

Syncs a project with cloud (not yet implemented in MVP).

**Parameters**:
- `projectId`: Project identifier

**Throws**: `ProjectSyncError` if sync fails

---

## Type Definitions

### PadState

```typescript
interface PadState {
  id: string;
  instrumentId: string;
  volume: number; // 0..1
  pitch: number; // semitones (-12..12)
  detune?: number; // cents (-100..100)
  filter?: FilterSettings;
  pan: number; // -1 (left) .. 1 (right)
  effectsChain: string[];
  isActive: boolean;
  isMuted: boolean;
  isSolo: boolean;
  recordedSequence?: NoteSequence;
  playbackMode: 'oneShot' | 'loop' | 'hold';
  quantize: boolean;
  color?: string;
}
```

### Instrument

```typescript
interface Instrument {
  id: string;
  name: string;
  type: 'sampler' | 'synth';
  soundPackId: string;
  settings: InstrumentSettings;
}
```

### Project

```typescript
interface Project {
  id: string;
  name: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  bpm: number;
  signature: { numerator: number; denominator: number };
  pads: PadState[];
  soundPackIds: string[];
  effects: EffectInstance[];
  masterVolume: number;
  masterEffects: string[];
  metadata: ProjectMetadata;
}
```

See [shared-types package](../packages/shared-types/src/models.ts) for complete type definitions.

---

## Error Handling

### AudioEngineError

Base class for audio engine errors.

```typescript
class AudioEngineError extends Error {
  code: string;
}
```

### InstrumentLoadError

Thrown when instrument loading fails.

```typescript
class InstrumentLoadError extends AudioEngineError {
  instrumentId: string;
}
```

### PadNotFoundError

Thrown when pad is not found.

```typescript
class PadNotFoundError extends AudioEngineError {
  padId: string;
}
```

### ProjectLoadError

Thrown when project loading fails.

```typescript
class ProjectLoadError extends Error {
  projectId: string;
}
```

### Example Error Handling

```typescript
try {
  await audioEngine.loadInstrument(instrument);
} catch (error) {
  if (error instanceof InstrumentLoadError) {
    console.error('Failed to load:', error.instrumentId);
  } else if (error instanceof AudioEngineError) {
    console.error('Audio error:', error.code);
  }
}
```

---

## Best Practices

1. **Always initialize AudioEngine before use**
   ```typescript
   await audioEngine.initialize();
   ```

2. **Clean up resources**
   ```typescript
   useEffect(() => {
     return () => audioEngine.dispose();
   }, []);
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     audioEngine.triggerPad(padId);
   } catch (error) {
     // Handle error
   }
   ```

4. **Use subscriptions for state updates**
   ```typescript
   const unsubscribe = padController.subscribe(updateUI);
   return unsubscribe;
   ```

5. **Validate parameters**
   ```typescript
   if (volume < 0 || volume > 1) {
     throw new Error('Volume must be 0..1');
   }
   ```

---

For more examples, see [Code Examples](./examples/code-examples.md).
