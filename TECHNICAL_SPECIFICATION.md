# EchoForge - Technical Specification

## 1. Overview

### 1.1 Project Summary
EchoForge is a real-time loop-pad music creation application with integrated social remix capabilities. It enables users to create, mix, and share musical compositions using an intuitive grid-based interface with professional-grade audio processing capabilities.

### 1.2 Target Audience
- EDM producers and electronic musicians
- Beat makers and loop artists
- Music enthusiasts exploring production
- Social media content creators
- Live performers seeking portable solutions

### 1.3 Success Criteria
- Sub-10ms audio latency for real-time playback
- Support for 32+ simultaneous voices
- Cross-platform availability (Web, iOS, Android, Desktop)
- Offline-first functionality with cloud sync
- Intuitive UI requiring <5 minutes to create first loop
- Community engagement with remix sharing

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Web UI   │  │  Mobile UI │  │    Desktop UI        │  │
│  │  (React)   │  │  (RN)      │  │    (Electron)        │  │
│  └──────┬─────┘  └──────┬─────┘  └──────────┬───────────┘  │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
┌─────────┴────────────────┴────────────────────┴──────────────┐
│                   Presentation Layer                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  UI Components (shared-ui)                             │  │
│  │  - PadGrid, TransportBar, SoundPackPicker, etc.       │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                      Core Engine Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  AudioEngine     │  │  ProjectManager  │                  │
│  │  - Web Audio API │  │  - State mgmt    │                  │
│  │  - Voice mgmt    │  │  - Persistence   │                  │
│  │  - Effects chain │  │  - Export/Import │                  │
│  └──────────────────┘  └──────────────────┘                  │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  PadController   │  │  Transport       │                  │
│  │  - Pad state     │  │  - Playback ctrl │                  │
│  │  - Event routing │  │  - Quantization  │                  │
│  └──────────────────┘  └──────────────────┘                  │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                      Data Layer                               │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  Local Storage   │  │  Cloud Sync      │                  │
│  │  - IndexedDB     │  │  - REST API      │                  │
│  │  - File System   │  │  - WebSocket     │                  │
│  └──────────────────┘  └──────────────────┘                  │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Core Engine:**
- TypeScript 5.x (strict mode)
- Web Audio API (primary audio backend)
- Tone.js (audio abstraction layer, optional)
- Web Workers (audio processing offload)

**Frontend Frameworks:**
- React 18+ (Web)
- React Native 0.72+ (Mobile)
- Electron 27+ (Desktop)

**Build & Tooling:**
- Vite (build tool)
- pnpm (package manager)
- Turborepo (monorepo orchestration)
- TypeScript Project References

**Testing:**
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- React Testing Library (component tests)

**Storage:**
- IndexedDB (local persistence)
- REST API + WebSocket (cloud sync)
- Binary audio file storage (WAV/MP3/OGG)

## 3. Core Data Models

### 3.1 PadState

The fundamental unit representing a single pad in the grid.

```typescript
export interface PadState {
  id: string;
  instrumentId: string;
  volume: number; // 0..1
  pitch: number; // semitones offset (-12..12)
  detune?: number; // cents (-100..100)
  filter?: FilterSettings;
  pan: number; // -1 (left) .. 1 (right)
  effectsChain: string[]; // effect instance IDs
  isActive: boolean;
  isMuted: boolean;
  isSolo: boolean;
  recordedSequence?: NoteSequence;
  playbackMode: 'oneShot' | 'loop' | 'hold';
  quantize: boolean;
  color?: string; // UI hint
}

export interface FilterSettings {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  cutoff: number; // Hz (20..20000)
  resonance: number; // Q (0.1..20)
}

export interface NoteSequence {
  notes: Array<{
    time: number; // seconds from start
    duration: number; // seconds
    velocity: number; // 0..1
  }>;
  length: number; // total sequence length in seconds
}
```

### 3.2 Instrument

Represents a sound source (sampler or synthesizer).

```typescript
export interface Instrument {
  id: string;
  name: string;
  type: 'sampler' | 'synth';
  soundPackId: string;
  settings: InstrumentSettings;
}

export type InstrumentSettings = SamplerSettings | SynthSettings;

export interface SamplerSettings {
  type: 'sampler';
  source: string; // URL or local path
  format: 'wav' | 'mp3' | 'ogg';
  sampleRate: number;
  bitDepth?: number;
  loopStart?: number; // seconds
  loopEnd?: number; // seconds
  attackTime: number; // seconds
  releaseTime: number; // seconds
}

export interface SynthSettings {
  type: 'synth';
  oscillatorType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  envelope: {
    attack: number; // seconds
    decay: number; // seconds
    sustain: number; // 0..1
    release: number; // seconds
  };
  filterEnvelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    baseFrequency: number;
    octaves: number;
  };
}
```

### 3.3 SoundPack

A collection of instruments grouped thematically.

```typescript
export interface SoundPack {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  instruments: Instrument[];
  tags: string[];
  coverImage?: string;
  previewUrl?: string;
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'proprietary';
  isDownloaded: boolean;
  sizeBytes?: number;
}

export interface SoundPackMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  tags: string[];
  coverImage?: string;
  previewUrl?: string;
  sizeBytes: number;
}
```

### 3.4 Project

The top-level container for a complete composition.

```typescript
export interface Project {
  id: string;
  name: string;
  author: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  bpm: number; // 60..300
  signature: { numerator: number; denominator: number }; // e.g., 4/4
  pads: PadState[];
  soundPackIds: string[];
  effects: EffectInstance[];
  masterVolume: number; // 0..1
  masterEffects: string[]; // effect instance IDs
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  description?: string;
  tags: string[];
  isPublic: boolean;
  remixOf?: string; // parent project ID
  collaborators?: string[]; // user IDs
  thumbnailUrl?: string;
  duration?: number; // seconds
}

export interface EffectInstance {
  id: string;
  type: 'reverb' | 'delay' | 'chorus' | 'distortion' | 'compressor' | 'eq';
  settings: EffectSettings;
  bypass: boolean;
}

export type EffectSettings = 
  | ReverbSettings 
  | DelaySettings 
  | ChorusSettings 
  | DistortionSettings
  | CompressorSettings
  | EQSettings;

export interface ReverbSettings {
  type: 'reverb';
  decay: number; // seconds
  preDelay: number; // seconds
  wetDryMix: number; // 0..1
}

export interface DelaySettings {
  type: 'delay';
  delayTime: number; // seconds
  feedback: number; // 0..1
  wetDryMix: number; // 0..1
}

export interface ChorusSettings {
  type: 'chorus';
  rate: number; // Hz
  depth: number; // 0..1
  wetDryMix: number; // 0..1
}

export interface DistortionSettings {
  type: 'distortion';
  amount: number; // 0..1
  tone: number; // 0..1
}

export interface CompressorSettings {
  type: 'compressor';
  threshold: number; // dB
  ratio: number; // 1..20
  attack: number; // seconds
  release: number; // seconds
}

export interface EQSettings {
  type: 'eq';
  bands: Array<{
    frequency: number; // Hz
    gain: number; // dB
    q: number; // 0.1..10
  }>;
}
```

## 4. Internal API Surface

### 4.1 AudioEngine API

The core audio processing engine.

```typescript
export interface IAudioEngine {
  /**
   * Initialize the audio context and engine
   * @throws {AudioEngineError} if initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Load an instrument into the engine
   * @param instrument Instrument configuration
   * @returns Loaded instrument ID
   * @throws {InstrumentLoadError} if loading fails
   */
  loadInstrument(instrument: Instrument): Promise<string>;

  /**
   * Trigger a pad to play
   * @param padId Pad identifier
   * @param velocity Note velocity (0..1)
   * @throws {PadNotFoundError} if pad doesn't exist
   */
  triggerPad(padId: string, velocity?: number): void;

  /**
   * Stop a playing pad
   * @param padId Pad identifier
   */
  stopPad(padId: string): void;

  /**
   * Update pad parameters in real-time
   * @param padId Pad identifier
   * @param updates Partial pad state updates
   */
  updatePadState(padId: string, updates: Partial<PadState>): void;

  /**
   * Set master volume
   * @param volume Volume level (0..1)
   */
  setMasterVolume(volume: number): void;

  /**
   * Get current audio latency
   * @returns Latency in milliseconds
   */
  getLatency(): number;

  /**
   * Clean up and release resources
   */
  dispose(): void;
}

export class AudioEngineError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AudioEngineError';
  }
}

export class InstrumentLoadError extends AudioEngineError {
  constructor(message: string, public instrumentId: string) {
    super(message, 'INSTRUMENT_LOAD_ERROR');
  }
}

export class PadNotFoundError extends AudioEngineError {
  constructor(public padId: string) {
    super(`Pad not found: ${padId}`, 'PAD_NOT_FOUND');
  }
}
```

### 4.2 PadController API

Manages pad state and routing.

```typescript
export interface IPadController {
  /**
   * Create a new pad
   * @param config Initial pad configuration
   * @returns Created pad state
   */
  createPad(config: Partial<PadState>): PadState;

  /**
   * Get pad by ID
   * @param padId Pad identifier
   * @returns Pad state or null if not found
   */
  getPad(padId: string): PadState | null;

  /**
   * Update pad state
   * @param padId Pad identifier
   * @param updates Partial pad state updates
   */
  updatePad(padId: string, updates: Partial<PadState>): void;

  /**
   * Delete a pad
   * @param padId Pad identifier
   */
  deletePad(padId: string): void;

  /**
   * Get all pads
   * @returns Array of all pad states
   */
  getAllPads(): PadState[];

  /**
   * Subscribe to pad state changes
   * @param callback Function called on state change
   * @returns Unsubscribe function
   */
  subscribe(callback: (pads: PadState[]) => void): () => void;
}
```

### 4.3 Transport API

Controls playback timing and synchronization.

```typescript
export interface ITransport {
  /**
   * Start playback
   */
  start(): void;

  /**
   * Stop playback
   */
  stop(): void;

  /**
   * Pause playback (maintains position)
   */
  pause(): void;

  /**
   * Get current playback state
   */
  getState(): 'playing' | 'stopped' | 'paused';

  /**
   * Set tempo
   * @param bpm Beats per minute (60..300)
   */
  setBPM(bpm: number): void;

  /**
   * Get current tempo
   */
  getBPM(): number;

  /**
   * Set time signature
   * @param numerator Beat count per measure
   * @param denominator Beat note value
   */
  setTimeSignature(numerator: number, denominator: number): void;

  /**
   * Get current playback position
   * @returns Position in seconds
   */
  getCurrentTime(): number;

  /**
   * Schedule an event at a specific time
   * @param time Time in seconds
   * @param callback Function to execute
   */
  scheduleAt(time: number, callback: () => void): void;

  /**
   * Enable/disable quantization
   * @param enabled Quantization state
   */
  setQuantization(enabled: boolean): void;

  /**
   * Subscribe to transport events
   * @param event Event type
   * @param callback Event handler
   */
  on(event: TransportEvent, callback: () => void): void;
}

export type TransportEvent = 'start' | 'stop' | 'pause' | 'beat' | 'measure';
```

### 4.4 ProjectManager API

Handles project persistence and synchronization.

```typescript
export interface IProjectManager {
  /**
   * Create a new project
   * @param config Initial project configuration
   * @returns Created project
   */
  createProject(config: Partial<Project>): Promise<Project>;

  /**
   * Load a project by ID
   * @param projectId Project identifier
   * @returns Project or null if not found
   * @throws {ProjectLoadError} if loading fails
   */
  loadProject(projectId: string): Promise<Project | null>;

  /**
   * Save current project
   * @param project Project to save
   * @throws {ProjectSaveError} if saving fails
   */
  saveProject(project: Project): Promise<void>;

  /**
   * Export project to file
   * @param projectId Project identifier
   * @param format Export format
   * @returns Blob containing exported data
   */
  exportProject(projectId: string, format: 'json' | 'wav' | 'mp3'): Promise<Blob>;

  /**
   * Import project from file
   * @param data Project data
   * @returns Imported project
   * @throws {ProjectImportError} if import fails
   */
  importProject(data: Blob): Promise<Project>;

  /**
   * List all projects
   * @returns Array of project metadata
   */
  listProjects(): Promise<ProjectMetadata[]>;

  /**
   * Delete a project
   * @param projectId Project identifier
   */
  deleteProject(projectId: string): Promise<void>;

  /**
   * Sync project with cloud
   * @param projectId Project identifier
   * @throws {ProjectSyncError} if sync fails
   */
  syncToCloud(projectId: string): Promise<void>;
}

export class ProjectLoadError extends Error {
  constructor(message: string, public projectId: string) {
    super(message);
    this.name = 'ProjectLoadError';
  }
}

export class ProjectSaveError extends Error {
  constructor(message: string, public projectId: string) {
    super(message);
    this.name = 'ProjectSaveError';
  }
}

export class ProjectImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectImportError';
  }
}

export class ProjectSyncError extends Error {
  constructor(message: string, public projectId: string) {
    super(message);
    this.name = 'ProjectSyncError';
  }
}
```

## 5. Non-Functional Requirements

### 5.1 Performance
- **Latency:** Sub-10ms audio latency on modern devices
- **Voices:** Support 32+ simultaneous voices
- **Memory:** <500MB RAM usage for typical project
- **Startup:** <2s from launch to interactive
- **Audio Processing:** 48kHz sample rate, 16-bit minimum

### 5.2 Reliability
- **Offline Support:** Full functionality without network
- **Data Persistence:** Auto-save every 30 seconds
- **Error Recovery:** Graceful degradation on resource constraints
- **Crash Recovery:** Restore last saved state on restart

### 5.3 Security
- **Data Privacy:** Local-first, opt-in cloud sync
- **Audio Assets:** Sandboxed file access
- **API Authentication:** OAuth 2.0 for cloud features
- **Content Validation:** Sanitize user-generated metadata

### 5.4 Accessibility
- **WCAG 2.1 Level AA** compliance
- **Keyboard Navigation:** Full app control without mouse
- **Screen Reader:** ARIA labels and landmarks
- **Color Contrast:** 4.5:1 minimum ratio
- **Focus Indicators:** Visible focus states

### 5.5 Compatibility
- **Web:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** iOS 14+, Android 8+
- **Desktop:** Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **Audio:** Web Audio API support required

## 6. MVP Scope

### 6.1 In-Scope Features

**Core Functionality:**
- [x] 8-pad grid with real-time playback
- [x] Sample-based instrument playback
- [x] Per-pad volume, pitch, and pan controls
- [x] Basic effects: reverb, delay, filter
- [x] Loop and one-shot playback modes
- [x] Project save/load to local storage
- [x] Basic transport controls (play/stop, BPM)
- [x] Quantization (beat-aligned triggering)

**UI Features:**
- [x] Responsive grid layout
- [x] Transport bar with playback controls
- [x] Per-pad parameter sliders
- [x] Sound pack selector
- [x] Basic project browser

**Platform Support:**
- [x] Web application (primary target)
- [ ] Mobile apps (post-MVP)
- [ ] Desktop app (post-MVP)

### 6.2 Out-of-Scope (Post-MVP)

- Recording/sequencing
- Advanced synthesis
- Social/remix features
- Cloud sync
- Collaboration features
- MIDI controller support
- Audio export (WAV/MP3)
- 16-pad grid
- Advanced effects (compressor, EQ, etc.)

## 7. Risk Assessment & Mitigation

### 7.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Audio latency >10ms | High | Medium | Use Web Audio API directly, optimize scheduling |
| Mobile performance issues | High | High | Start with web, optimize before mobile port |
| Browser compatibility | Medium | Low | Feature detection, graceful degradation |
| Large audio file downloads | Medium | Medium | Lazy loading, compression, CDN |

### 7.2 Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex UI learning curve | High | Medium | User testing, progressive disclosure |
| Limited sound library | Medium | Low | Partner with creators, open submission |
| Competition from DAWs | Medium | High | Focus on simplicity, social features |

## 8. Roadmap

### 8.1 Phase 1: MVP (Weeks 1-4)
- Week 1: Core engine + basic audio playback
- Week 2: UI components + grid interaction
- Week 3: Effects + parameter controls
- Week 4: Polish + testing + documentation

### 8.2 Phase 2: Enhancement (Weeks 5-8)
- Recording/sequencing
- Audio export
- 16-pad grid
- Advanced effects
- Mobile responsive design

### 8.3 Phase 3: Social (Weeks 9-12)
- User accounts
- Project sharing
- Remix functionality
- Community sound packs
- Cloud sync

### 8.4 Phase 4: Platform Expansion (Weeks 13-16)
- React Native mobile apps
- Electron desktop app
- MIDI controller support
- VST/plugin integration

## 9. Development Guidelines

### 9.1 Code Standards
- TypeScript strict mode enabled
- ESLint with recommended rules
- Prettier for formatting
- 80%+ test coverage for core modules
- JSDoc comments for public APIs

### 9.2 Git Workflow
- Feature branches from `main`
- PR reviews required
- CI checks must pass
- Semantic versioning

### 9.3 Performance Budgets
- Bundle size: <500KB (gzipped)
- Initial load: <2s on 3G
- Time to Interactive: <3s
- Lighthouse score: >90

## 10. References

- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
