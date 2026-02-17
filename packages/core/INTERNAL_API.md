# Internal API Surface

This document defines the minimal internal API surface for the LoopPad audio system with clear module boundaries.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Boundaries](#module-boundaries)
3. [Error Handling](#error-handling)
4. [Export Surfaces](#export-surfaces)
5. [Usage Examples](#usage-examples)

## Architecture Overview

The LoopPad system is organized into distinct modules with clear responsibilities:

```
┌─────────────────────────────────────────────────┐
│              Public API (index.ts)              │
│  - AudioEngine class                            │
│  - Configuration types                          │
│  - Error types and utilities                    │
│  - Module interfaces                            │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          Internal Modules (internal/)           │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ IAudioEngine │  │  ITransport  │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ISoundLoader  │  │  IVoicePool  │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   IMixer     │  │IEffectsProc. │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            Error Handling System                │
│  - Discriminated union types                    │
│  - Type guards                                   │
│  - Error factories                               │
└─────────────────────────────────────────────────┘
```

## Module Boundaries

### 1. Audio Engine Module (`IAudioEngine`)

**Responsibility**: Web Audio API context management and audio processing lifecycle

**Interface**:
```typescript
interface IAudioEngine {
  initialize(): Result<void, LoopPadError>;
  start(): Result<void, LoopPadError>;
  stop(): Result<void, LoopPadError>;
  getState(): 'suspended' | 'running' | 'closed' | 'uninitialized';
  getCurrentTime(): number;
  getSampleRate(): number;
}
```

**Boundaries**:
- Manages AudioContext lifecycle
- Does NOT handle sound loading (that's ISoundLoader's responsibility)
- Does NOT handle playback scheduling (that's ITransport's responsibility)
- Does NOT handle mixing (that's IMixer's responsibility)

### 2. Transport Module (`ITransport`)

**Responsibility**: Playback timing, tempo control, and event scheduling

**Interface**:
```typescript
interface ITransport {
  start(): Result<void, LoopPadError>;
  stop(): Result<void, LoopPadError>;
  pause(): Result<void, LoopPadError>;
  seek(timeInSeconds: number): Result<void, LoopPadError>;
  getPosition(): number;
  setTempo(bpm: number): Result<void, LoopPadError>;
  getTempo(): number;
  schedule(time: number, callback: () => void): Result<string, LoopPadError>;
  cancelScheduled(id: string): Result<void, LoopPadError>;
}
```

**Boundaries**:
- Manages playback state and timing
- Does NOT load audio files
- Does NOT allocate audio voices
- Coordinates with IAudioEngine for timing information

### 3. Sound Loader Module (`ISoundLoader`)

**Responsibility**: Audio file loading and buffer management

**Interface**:
```typescript
interface ISoundLoader {
  load(url: string): Result<AudioBuffer, LoopPadError>;
  loadBatch(urls: string[]): Result<Map<string, AudioBuffer>, LoopPadError>;
  getBuffer(url: string): Result<AudioBuffer, LoopPadError>;
  isLoaded(url: string): boolean;
  unload(url: string): Result<void, LoopPadError>;
  clear(): void;
}
```

**Boundaries**:
- Loads and caches AudioBuffers
- Does NOT play sounds
- Does NOT manage audio context
- Provides buffers to other modules

### 4. Voice Pool Module (`IVoicePool`)

**Responsibility**: Polyphonic voice allocation and management

**Interface**:
```typescript
interface IVoicePool {
  allocate(): Result<IVoice, LoopPadError>;
  release(voice: IVoice): void;
  getAvailableCount(): number;
  getTotalCount(): number;
  stopAll(): void;
}

interface IVoice {
  readonly id: string;
  trigger(buffer: AudioBuffer, options?: VoiceTriggerOptions): Result<void, LoopPadError>;
  stop(time?: number): void;
  isPlaying(): boolean;
  setVolume(volume: number): void;
  setPan(pan: number): void;
}
```

**Boundaries**:
- Manages voice allocation and reuse
- Does NOT load sounds
- Does NOT schedule playback
- Provides voices to modules that need playback

### 5. Mixer Module (`IMixer`)

**Responsibility**: Multi-track audio mixing

**Interface**:
```typescript
interface IMixer {
  createTrack(name: string): Result<ITrack, LoopPadError>;
  getTrack(trackId: string): Result<ITrack, LoopPadError>;
  removeTrack(trackId: string): Result<void, LoopPadError>;
  getTracks(): ITrack[];
  setMasterVolume(volume: number): void;
  getMasterVolume(): number;
}

interface ITrack {
  readonly id: string;
  readonly name: string;
  setVolume(volume: number): void;
  getVolume(): number;
  setMute(mute: boolean): void;
  isMuted(): boolean;
  setSolo(solo: boolean): void;
  isSoloed(): boolean;
  setPan(pan: number): void;
  getPan(): number;
  getNode(): AudioNode;
}
```

**Boundaries**:
- Manages track routing and mixing
- Does NOT handle individual voice playback
- Does NOT apply effects (that's IEffectsProcessor)
- Provides AudioNodes for connection

### 6. Effects Processor Module (`IEffectsProcessor`)

**Responsibility**: Audio effects chain management

**Interface**:
```typescript
interface IEffectsProcessor {
  addEffect(effect: IAudioEffect): Result<string, LoopPadError>;
  removeEffect(effectId: string): Result<void, LoopPadError>;
  getEffect(effectId: string): Result<IAudioEffect, LoopPadError>;
  bypass(bypass: boolean): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

interface IAudioEffect {
  readonly id: string;
  readonly type: string;
  getNode(): AudioNode;
  setParameter(name: string, value: number): Result<void, LoopPadError>;
  getParameter(name: string): Result<number, LoopPadError>;
  bypass(bypass: boolean): void;
}
```

**Boundaries**:
- Manages effect chain
- Does NOT mix tracks
- Does NOT allocate voices
- Works with AudioNodes from other modules

## Error Handling

### Discriminator-Based Error System

All errors use a discriminated union pattern for type-safe error handling:

```typescript
type LoopPadError =
  | AudioContextError
  | BufferLoadError
  | InvalidSampleRateError
  | TransportError
  | TimingError
  | ResourceNotFoundError
  | ResourceLimitError
  | ConfigValidationError;
```

### Base Error Interface

```typescript
interface BaseError {
  readonly kind: string;        // Discriminator
  readonly message: string;
  readonly timestamp: number;
}
```

### Error Types

1. **AudioContextError**: Audio context initialization and state issues
   ```typescript
   {
     kind: 'AudioContextError',
     reason: 'initialization_failed' | 'context_suspended' | 'context_closed',
     message: string,
     timestamp: number
   }
   ```

2. **BufferLoadError**: Audio file loading failures
   ```typescript
   {
     kind: 'BufferLoadError',
     url: string,
     statusCode?: number,
     message: string,
     timestamp: number
   }
   ```

3. **ResourceLimitError**: Resource exhaustion
   ```typescript
   {
     kind: 'ResourceLimitError',
     resourceType: 'voices' | 'buffers' | 'tracks',
     limit: number,
     requested: number,
     message: string,
     timestamp: number
   }
   ```

### Type Guards

Type guards enable exhaustive pattern matching:

```typescript
if (isAudioContextError(error)) {
  // TypeScript knows error is AudioContextError
  console.log(error.reason);
}
```

### Error Factories

Factory functions ensure consistent error creation:

```typescript
const error = createBufferLoadError(
  '/sounds/kick.wav',
  'Network error',
  404
);
```

### Result Type

Operations that can fail return a `Result` type:

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

Usage:

```typescript
const result = soundLoader.load('/sounds/kick.wav');

if (isSuccess(result)) {
  // TypeScript knows result.value is AudioBuffer
  playBuffer(result.value);
} else {
  // TypeScript knows result.error is LoopPadError
  handleError(result.error);
}
```

## Export Surfaces

### Public API (`src/index.ts`)

**Exports for External Consumers**:

```typescript
// Core functionality
export { AudioEngine } from './index';
export type { AudioEngineConfig } from './index';

// Error types and utilities
export type { LoopPadError, BaseError, ... } from './internal/errors/BaseError';
export { isAudioContextError, createBufferLoadError, ... } from './internal/errors/BaseError';

// Result type
export type { Result } from './internal/types/Result';
export { success, failure, isSuccess, isFailure } from './internal/types/Result';

// Configuration types
export type { LoopPadConfig, ... } from './internal/types/Config';

// Module interfaces (for implementations and testing)
export type { IAudioEngine, ITransport, ... } from './internal/modules/AudioModules';
```

### Internal API (`src/internal/index.ts`)

**Exports for Internal Implementation**:

```typescript
// All error types and utilities
export * from './errors/BaseError';

// Result type
export * from './types/Result';

// Configuration interfaces
export * from './types/Config';

// Module interfaces
export * from './modules/AudioModules';
```

### Module Organization

```
src/
├── index.ts                    # Public API surface
├── internal/                   # Internal modules (not in public API)
│   ├── index.ts               # Internal API aggregation
│   ├── errors/
│   │   └── BaseError.ts       # Error types and utilities
│   ├── types/
│   │   ├── Result.ts          # Result type
│   │   └── Config.ts          # Configuration types
│   └── modules/
│       └── AudioModules.ts    # Module interfaces
└── examples/                   # Usage examples (documentation only)
    ├── module-composition.ts   # Module interaction examples
    └── error-handling.ts       # Error handling patterns
```

## Usage Examples

### Example 1: Initialize and Play

```typescript
import {
  IAudioEngine,
  ISoundLoader,
  IVoicePool,
  isSuccess,
  isFailure,
} from '@looppad/core';

async function playSound(
  audioEngine: IAudioEngine,
  soundLoader: ISoundLoader,
  voicePool: IVoicePool,
  url: string
): Promise<void> {
  // Initialize audio engine (from user interaction)
  const initResult = audioEngine.initialize();
  if (isFailure(initResult)) {
    console.error('Initialization failed:', initResult.error.message);
    return;
  }

  // Load sound
  const loadResult = soundLoader.load(url);
  if (isFailure(loadResult)) {
    console.error('Load failed:', loadResult.error.message);
    return;
  }

  // Allocate voice
  const voiceResult = voicePool.allocate();
  if (isFailure(voiceResult)) {
    console.error('Voice allocation failed:', voiceResult.error.message);
    return;
  }

  // Play sound
  const voice = voiceResult.value;
  const playResult = voice.trigger(loadResult.value, { volume: 0.8 });
  
  if (isSuccess(playResult)) {
    console.log('Playing sound!');
  }
}
```

### Example 2: Error Handling with Type Guards

```typescript
import {
  ISoundLoader,
  isBufferLoadError,
  isResourceLimitError,
} from '@looppad/core';

function handleLoadError(result: Result<AudioBuffer, LoopPadError>): void {
  if (isSuccess(result)) {
    return;
  }

  const error = result.error;

  // Type-safe error discrimination
  if (isBufferLoadError(error)) {
    if (error.statusCode === 404) {
      console.error(`File not found: ${error.url}`);
    } else if (error.statusCode === 403) {
      console.error(`Access denied: ${error.url}`);
    } else {
      console.error(`Load error: ${error.message}`);
    }
  } else if (isResourceLimitError(error)) {
    console.error(`Resource limit: ${error.limit} ${error.resourceType}`);
  }
}
```

### Example 3: Module Composition

```typescript
import {
  LoopPadConfig,
  IAudioEngine,
  ITransport,
  IMixer,
} from '@looppad/core';

class LoopPadApp {
  constructor(
    private engine: IAudioEngine,
    private transport: ITransport,
    private mixer: IMixer
  ) {}

  async initialize(config: LoopPadConfig): Promise<Result<void, LoopPadError>> {
    // Initialize engine
    const engineResult = this.engine.initialize();
    if (isFailure(engineResult)) return engineResult;

    // Configure transport
    const tempoResult = this.transport.setTempo(config.transport?.tempo ?? 120);
    if (isFailure(tempoResult)) return tempoResult;

    // Create mixer tracks
    const trackResult = this.mixer.createTrack('main');
    if (isFailure(trackResult)) return trackResult;

    return success(undefined);
  }
}
```

## Design Principles

1. **Clear Boundaries**: Each module has a single, well-defined responsibility
2. **Type Safety**: Discriminated unions enable exhaustive pattern matching
3. **Error Transparency**: All error conditions are explicit in return types
4. **Composability**: Modules are designed to work together via interfaces
5. **Testability**: Interface-based design enables easy mocking and testing
6. **Minimal Surface**: Public API exports only what consumers need

## Future Extensibility

The internal API is designed to support:

- **Plugin System**: `IAudioEffect` interface allows custom effects
- **Custom Voices**: `IVoice` interface allows alternative voice implementations
- **Storage Backends**: `ISoundLoader` can be implemented with different backends
- **Custom Transport**: `ITransport` interface allows alternative timing systems
- **Effect Chains**: `IEffectsProcessor` supports dynamic effect routing

## Summary

This internal API surface provides:

1. ✅ **TypeScript interfaces for internal modules** - See `src/internal/modules/AudioModules.ts`
2. ✅ **Clear boundaries and export surfaces** - Public API in `src/index.ts`, internal in `src/internal/`
3. ✅ **Error types with discriminator-based handling** - See `src/internal/errors/BaseError.ts`
4. ✅ **Example code showing composition** - See `src/examples/module-composition.ts`
5. ✅ **Sample error handling patterns** - See `src/examples/error-handling.ts`

The design supports maintainability, testability, and future extensibility while keeping the public API surface minimal and focused.
