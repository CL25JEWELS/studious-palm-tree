# LoopPad MVP Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Web Application Layer                        │
│                          (@looppad/web)                              │
└────────────────┬─────────────────────────────────┬──────────────────┘
                 │                                 │
                 ▼                                 ▼
┌────────────────────────────────┐  ┌──────────────────────────────┐
│      PadController             │  │     ProjectManager           │
│  - Handle pad interactions     │  │  - Project CRUD operations   │
│  - Map pads to instruments     │  │  - Project state management  │
│  - Trigger audio playback      │  │  - Auto-save functionality   │
└────────┬───────────────────────┘  └──────────────┬───────────────┘
         │                                          │
         │         ┌────────────────────────────────┘
         │         │
         ▼         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Core Audio Engine Layer                         │
│                        (@looppad/core)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │   AudioEngine     │───▶│    Transport     │───▶│ VoicePool    │ │
│  │ - Web Audio API   │    │ - BPM/Timing     │    │ - Polyphony  │ │
│  │ - Master output   │    │ - Play/Stop      │    │ - Voice mgmt │ │
│  │ - Effects chain   │    │ - Sequencing     │    └──────────────┘ │
│  └───────────────────┘    └──────────────────┘                      │
│          │                                                           │
│          ▼                                                           │
│  ┌───────────────────┐    ┌──────────────────┐                     │
│  │  SoundPackService │    │  SoundLoader     │                     │
│  │ - Load packs      │───▶│ - Fetch audio    │                     │
│  │ - Pack metadata   │    │ - Decode buffers │                     │
│  │ - Pack discovery  │    │ - Cache mgmt     │                     │
│  └───────────────────┘    └──────────────────┘                     │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Storage & Persistence                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │  StorageService   │    │   UserSession    │    │   Cloud API  │ │
│  │ - LocalStorage    │───▶│ - User state     │───▶│ - Sync       │ │
│  │ - IndexedDB       │    │ - Preferences    │    │ - Backup     │ │
│  │ - Project store   │    │ - Auth tokens    │    │ - Share      │ │
│  └───────────────────┘    └──────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Interaction ──▶ PadController ──▶ AudioEngine ──▶ Web Audio API ──▶ 🔊 Output
                          │                  │
                          ▼                  ▼
                    ProjectManager     SoundPackService
                          │                  │
                          ▼                  ▼
                    StorageService      SoundLoader
```

## Module Boundaries

### AudioEngine
**Responsibility**: Core Web Audio API management, master output, effects chain  
**Dependencies**: None (pure audio)  
**Exports**: `AudioEngine`, `AudioEngineConfig`, `AudioEngineError`  
**Public API**:
- `start()`: Initialize audio context
- `stop()`: Cleanup audio resources
- `getMasterGain()`: Access master volume
- `getContext()`: Access Web Audio context

### PadController
**Responsibility**: Manage pad grid interactions and state  
**Dependencies**: AudioEngine, SoundPackService  
**Exports**: `PadController`, `PadControllerConfig`, `PadState`  
**Public API**:
- `triggerPad(padId: string)`: Trigger pad playback
- `setPadInstrument(padId: string, instrument: Instrument)`: Assign instrument
- `getPadState(padId: string)`: Get current pad state
- `clearPad(padId: string)`: Clear pad assignment

### Transport
**Responsibility**: Timing, sequencing, and playback control  
**Dependencies**: AudioEngine  
**Exports**: `Transport`, `TransportConfig`, `TransportState`  
**Public API**:
- `play()`: Start playback
- `stop()`: Stop playback
- `setBPM(bpm: number)`: Set tempo
- `getCurrentTime()`: Get current time in beats

### ProjectManager
**Responsibility**: Project lifecycle and state management  
**Dependencies**: StorageService, PadController, Transport  
**Exports**: `ProjectManager`, `Project`, `ProjectError`  
**Public API**:
- `createProject(name: string)`: Create new project
- `loadProject(id: string)`: Load existing project
- `saveProject()`: Save current project
- `exportProject()`: Export project data

### SoundPackService
**Responsibility**: Sound pack loading and management  
**Dependencies**: SoundLoader  
**Exports**: `SoundPackService`, `SoundPack`, `Instrument`  
**Public API**:
- `loadSoundPack(packId: string)`: Load sound pack
- `getAvailablePacks()`: List available packs
- `getInstruments(packId: string)`: Get instruments from pack

### StorageService
**Responsibility**: Data persistence (local and cloud)  
**Dependencies**: None  
**Exports**: `StorageService`, `StorageConfig`, `StorageError`  
**Public API**:
- `save(key: string, data: any)`: Save data
- `load(key: string)`: Load data
- `delete(key: string)`: Delete data
- `list()`: List all stored keys

## Error Handling Strategy

All modules follow a consistent error handling pattern:
1. Custom error classes extending `Error`
2. Error codes for programmatic handling
3. User-friendly messages for UI display
4. Stack traces preserved for debugging

## Performance Considerations

- **Audio latency**: <10ms target via Web Audio API 'interactive' latency hint
- **Voice polyphony**: 32 simultaneous voices via VoicePool
- **Sound loading**: Lazy load with caching in SoundLoader
- **State updates**: Immutable patterns for predictable React rendering
