# Module Boundaries and API Surface

This document defines the boundaries, responsibilities, and public APIs for each module in the LoopPad MVP architecture.

## Design Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Direction**: Dependencies flow from high-level (UI) to low-level (audio)
3. **Interface Segregation**: Modules expose only what's needed
4. **Loose Coupling**: Modules communicate through well-defined interfaces
5. **No Circular Dependencies**: Clear dependency hierarchy

---

## Module Dependency Graph

```
┌─────────────────────────────────────────┐
│         Web Application                 │
└──────────┬─────────────┬────────────────┘
           │             │
           ▼             ▼
    ┌──────────┐   ┌──────────────┐
    │   Pad    │   │   Project    │
    │Controller│   │  Manager     │
    └─────┬────┘   └──────┬───────┘
          │               │
          ├───────────────┤
          │               │
          ▼               ▼
    ┌──────────┐   ┌──────────────┐
    │  Audio   │   │   Storage    │
    │  Engine  │   │   Service    │
    └────┬─────┘   └──────────────┘
         │
         ▼
    ┌──────────┐
    │Transport │
    └──────────┘
         │
         ▼
    ┌──────────┐
    │SoundPack │
    │ Service  │
    └──────────┘
```

---

## AudioEngine

### Responsibility
Core Web Audio API management, master audio output, effects chain management.

### Location
`packages/core/src/engine/AudioEngine.ts`

### Dependencies
- **None** - Pure audio functionality with no external dependencies

### Exports
```typescript
export class AudioEngine {
  constructor(config?: AudioEngineConfig);
  
  // Lifecycle
  start(): void;
  stop(): void;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  
  // Context access
  getContext(): AudioContext;
  getMasterGain(): GainNode;
  getCurrentTime(): number;
  
  // State
  isStarted(): boolean;
  getState(): AudioContextState;
}

export interface AudioEngineConfig {
  sampleRate?: number;
  bufferSize?: number;
  logger?: Logger;
}

export class AudioEngineError extends LoopPadError {
  // Error codes: AUDIO_CONTEXT_INIT_FAILED, AUDIO_CONTEXT_SUSPENDED, etc.
}
```

### Internal (Not Exported)
- Audio node graph implementation
- Buffer management
- Effects chain internals
- Audio worklet registration

### Usage Example
```typescript
const engine = new AudioEngine({ sampleRate: 48000 });
await engine.start(); // Must be called from user interaction
const context = engine.getContext();
const masterGain = engine.getMasterGain();
```

---

## PadController

### Responsibility
Manage the pad grid, handle pad interactions, maintain pad state, trigger audio playback.

### Location
`packages/core/src/controllers/PadController.ts`

### Dependencies
- `AudioEngine` (required)
- `SoundPackService` (optional, for instrument assignment)

### Exports
```typescript
export class PadController {
  constructor(config: PadControllerConfig);
  
  // Pad management
  getPadState(padId: string): PadState;
  setPadInstrument(padId: string, instrument: Instrument): void;
  clearPad(padId: string): void;
  getAllPads(): PadState[];
  
  // Playback control
  triggerPad(padId: string, velocity?: number): void;
  stopPad(padId: string): void;
  stopAllPads(): void;
  
  // Recording
  armPad(padId: string): void;
  disarmPad(padId: string): void;
  startRecording(padId: string): void;
  stopRecording(padId: string): void;
  
  // Configuration
  setPadVolume(padId: string, volume: number): void;
  setPadPan(padId: string, pan: number): void;
  setPadColor(padId: string, color: string): void;
}

export interface PadControllerConfig {
  rows: number;
  columns: number;
  audioEngine: AudioEngine;
  colorPalette?: string[];
}

export interface PadState {
  id: string;
  row: number;
  column: number;
  instrument: Instrument | null;
  isPlaying: boolean;
  isRecording: boolean;
  isArmed: boolean;
  color: string;
  volume: number;
  pan: number;
  pattern?: Pattern;
}

export class PadControllerError extends LoopPadError {
  // Error codes: PAD_NOT_FOUND, INSTRUMENT_NOT_ASSIGNED, etc.
}
```

### Internal (Not Exported)
- Voice management per pad
- Note scheduling logic
- Pattern playback internals
- Pad grid indexing

### Usage Example
```typescript
const padController = new PadController({
  rows: 4,
  columns: 4,
  audioEngine: engine,
});

padController.setPadInstrument('pad-0-0', kickDrum);
padController.triggerPad('pad-0-0');
```

---

## Transport

### Responsibility
Timing, tempo control, sequencing, playback state management.

### Location
`packages/core/src/engine/Transport.ts`

### Dependencies
- `AudioEngine` (required)

### Exports
```typescript
export class Transport {
  constructor(config: TransportConfig);
  
  // Playback control
  play(): void;
  stop(): void;
  pause(): void;
  
  // Timing
  setBPM(bpm: number): void;
  setTimeSignature(numerator: number, denominator: number): void;
  getCurrentTime(): number; // In beats
  getCurrentBar(): number;
  getCurrentBeat(): number;
  
  // Loop control
  setLoop(enabled: boolean, start?: number, end?: number): void;
  getLoopRegion(): [number, number] | null;
  
  // State
  getState(): TransportState;
  isPlaying(): boolean;
}

export interface TransportConfig {
  bpm: number;
  timeSignature: [number, number];
  audioEngine: AudioEngine;
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  timeSignature: [number, number];
  currentBeat: number;
  currentBar: number;
  loopEnabled: boolean;
  loopStart?: number;
  loopEnd?: number;
}

export class TransportError extends LoopPadError {
  // Error codes: INVALID_BPM, INVALID_TIME_SIGNATURE, etc.
}
```

### Internal (Not Exported)
- Scheduler implementation
- Beat calculation logic
- Lookahead buffer management
- Metronome implementation

### Usage Example
```typescript
const transport = new Transport({
  bpm: 120,
  timeSignature: [4, 4],
  audioEngine: engine,
});

transport.play();
transport.setBPM(140);
transport.setLoop(true, 0, 16);
```

---

## ProjectManager

### Responsibility
Project lifecycle management, state persistence, auto-save, import/export.

### Location
`packages/core/src/managers/ProjectManager.ts`

### Dependencies
- `StorageService` (required)
- `PadController` (required)
- `Transport` (required)

### Exports
```typescript
export class ProjectManager {
  constructor(config: ProjectManagerConfig);
  
  // Project lifecycle
  createProject(name: string, options?: ProjectOptions): Promise<Project>;
  loadProject(projectId: string): Promise<Project>;
  saveProject(): Promise<void>;
  deleteProject(projectId: string): Promise<void>;
  
  // State management
  getCurrentProject(): Project | null;
  hasUnsavedChanges(): boolean;
  markClean(): void;
  markDirty(): void;
  
  // Auto-save
  enableAutoSave(intervalMs: number): void;
  disableAutoSave(): void;
  
  // Import/Export
  exportProject(): Promise<string>; // Returns JSON
  importProject(data: string): Promise<Project>;
  
  // List operations
  listProjects(): Promise<ProjectMetadata[]>;
  searchProjects(query: string): Promise<ProjectMetadata[]>;
}

export interface ProjectManagerConfig {
  storage: StorageService;
  padController: PadController;
  transport: Transport;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  bpm: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  masterVolume: number;
  pads: PadState[];
  soundPackIds: string[];
  createdAt: Date;
  modifiedAt: Date;
  lastSaved?: Date;
  isDirty: boolean;
  tags?: string[];
  visibility: ProjectVisibility;
}

export type ProjectVisibility = 'private' | 'unlisted' | 'public';

export class ProjectManagerError extends LoopPadError {
  // Error codes: PROJECT_NOT_FOUND, PROJECT_SAVE_FAILED, etc.
}
```

### Internal (Not Exported)
- Auto-save timer management
- Project validation logic
- Serialization/deserialization
- Conflict resolution

### Usage Example
```typescript
const projectManager = new ProjectManager({
  storage: storageService,
  padController: padController,
  transport: transport,
});

const project = await projectManager.createProject('My Beat');
await projectManager.saveProject();
projectManager.enableAutoSave(30000); // Auto-save every 30s
```

---

## SoundPackService

### Responsibility
Sound pack discovery, loading, caching, and instrument management.

### Location
`packages/core/src/services/SoundPackService.ts`

### Dependencies
- `AudioEngine` (required) - For audio decoding

### Exports
```typescript
export class SoundPackService {
  constructor(config: SoundPackServiceConfig);
  
  // Pack management
  loadSoundPack(packId: string): Promise<SoundPack>;
  unloadSoundPack(packId: string): void;
  isPackLoaded(packId: string): boolean;
  getLoadedPacks(): SoundPack[];
  
  // Discovery
  getAvailablePacks(): Promise<SoundPack[]>;
  searchPacks(query: string): Promise<SoundPack[]>;
  
  // Instruments
  getInstruments(packId: string): Instrument[];
  getInstrument(packId: string, instrumentId: string): Instrument | null;
  
  // Cache management
  clearCache(): void;
  getCacheSize(): number;
}

export interface SoundPackServiceConfig {
  audioEngine: AudioEngine;
  cacheEnabled?: boolean;
  maxCacheSize?: number; // In bytes
  packRepositoryUrl?: string;
}

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  genre: string;
  instruments: Instrument[];
  coverArtUrl?: string;
  author?: string;
  version: string;
  createdAt: Date;
  sizeBytes?: number;
  isLoaded: boolean;
}

export interface Instrument {
  id: string;
  name: string;
  packId: string;
  type: InstrumentType;
  buffer: AudioBuffer | null;
  url: string;
  metadata?: InstrumentMetadata;
}

export type InstrumentType = 
  | 'drum' | 'bass' | 'synth' | 'vocal' | 'fx' | 'melodic';

export class SoundPackServiceError extends LoopPadError {
  // Error codes: PACK_NOT_FOUND, PACK_LOAD_FAILED, NETWORK_ERROR, etc.
}
```

### Internal (Not Exported)
- HTTP fetching logic
- Audio buffer decoding
- Cache eviction policies
- Pack manifest parsing

### Usage Example
```typescript
const soundPackService = new SoundPackService({
  audioEngine: engine,
  cacheEnabled: true,
});

const pack = await soundPackService.loadSoundPack('trap-drums');
const instruments = soundPackService.getInstruments('trap-drums');
console.log('Loaded', instruments.length, 'instruments');
```

---

## StorageService

### Responsibility
Data persistence via localStorage, IndexedDB, or cloud storage.

### Location
`packages/core/src/services/StorageService.ts`

### Dependencies
- **None** - Pure storage functionality

### Exports
```typescript
export class StorageService {
  constructor(config: StorageConfig);
  
  // Basic operations
  save(key: string, data: any): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
  
  // Batch operations
  saveMany(items: Record<string, any>): Promise<void>;
  loadMany<T>(keys: string[]): Promise<Record<string, T>>;
  deleteMany(keys: string[]): Promise<void>;
  
  // Storage info
  getSize(): Promise<number>; // In bytes
  getAvailableSpace(): Promise<number>;
  
  // Cloud sync (when using cloud backend)
  sync(): Promise<void>;
  enableSync(intervalMs: number): void;
  disableSync(): void;
}

export interface StorageConfig {
  backend: 'localStorage' | 'indexedDB' | 'cloud';
  namespace?: string;
  cloudEndpoint?: string;
  cloudCredentials?: {
    apiKey: string;
    userId: string;
  };
}

export class StorageServiceError extends LoopPadError {
  // Error codes: STORAGE_NOT_AVAILABLE, QUOTA_EXCEEDED, etc.
}
```

### Internal (Not Exported)
- Backend adapter implementations
- Serialization/deserialization
- Encryption (for cloud)
- Conflict resolution
- Retry logic

### Usage Example
```typescript
const storage = new StorageService({
  backend: 'localStorage',
  namespace: 'looppad',
});

await storage.save('user-prefs', { theme: 'dark' });
const prefs = await storage.load('user-prefs');
```

---

## Module Communication Patterns

### Event Flow
```
User clicks pad
  → PadController.triggerPad()
    → AudioEngine plays sound
  → PadController updates state
  → UI re-renders pad
```

### State Flow
```
User changes BPM
  → Transport.setBPM()
    → ProjectManager marks dirty
  → Auto-save timer triggers
    → StorageService.save()
```

### Error Flow
```
Sound pack load fails
  → SoundPackService throws error
  → Error bubbles to UI layer
  → UI shows error.userMessage
  → Error logged to analytics
```

---

## Integration Guidelines

### For Web Application Developers

1. **Initialize in correct order**:
   ```typescript
   // 1. Core services
   const engine = new AudioEngine();
   const storage = new StorageService();
   
   // 2. Dependent services
   const transport = new Transport({ audioEngine: engine });
   const padController = new PadController({ audioEngine: engine });
   
   // 3. High-level managers
   const projectManager = new ProjectManager({
     storage, padController, transport
   });
   ```

2. **Handle errors at boundaries**:
   ```typescript
   try {
     await projectManager.loadProject(id);
   } catch (error) {
     if (error instanceof LoopPadError) {
       showNotification(error.userMessage);
     }
   }
   ```

3. **Subscribe to state changes**:
   ```typescript
   // Use React hooks or event emitters
   const padState = padController.getPadState('pad-0-0');
   useEffect(() => {
     // Update UI when pad state changes
   }, [padState]);
   ```

### For Core Module Developers

1. **No direct DOM access** in core modules
2. **Use dependency injection** for configuration
3. **Throw typed errors** for all failure cases
4. **Document all public APIs** with JSDoc
5. **Write unit tests** for all public methods

---

## Testing Boundaries

Each module should have:
- **Unit tests**: Test in isolation with mocked dependencies
- **Integration tests**: Test with real dependencies
- **Error tests**: Verify all error codes are thrown correctly

Example test structure:
```
packages/core/src/
  controllers/
    PadController.ts
    __tests__/
      PadController.test.ts
      PadController.integration.test.ts
```
