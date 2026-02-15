# LoopPad Architecture

## Overview

LoopPad is a TypeScript-first web-based drum machine/sampler built on the Web Audio API. The architecture follows a modular monorepo pattern with clear separation between core engine logic and UI presentation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer (@looppad/web)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   PadGrid    │  │  Transport   │  │ SoundPack    │  │
│  │              │  │              │  │  Selector    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│              Core Engine (@looppad/core)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ AudioEngine                                       │   │
│  │  - Web Audio Context Management                  │   │
│  │  - Master Output Chain                           │   │
│  │  - Voice Management (32+ voices)                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │  Transport   │  │  VoicePool   │  │ SoundLoader │   │
│  │              │  │              │  │             │   │
│  └──────────────┘  └──────────────┘  └─────────────┘   │
└──────────────────────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                  Web Audio API                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Browser Native Audio Engine                       │   │
│  │  - Audio Buffer Management                        │   │
│  │  - Real-time Audio Graph Processing               │   │
│  │  - Hardware Audio Output                          │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Data Models (`@looppad/core/models`)

**Pad**: Represents a single trigger point
- Maps to keyboard/UI buttons
- Contains instrument assignment
- Stores velocity and mute/solo state

**Instrument**: Audio settings for a sound
- References a Sample
- Includes playback parameters (volume, pan, pitch)
- Contains ADSR envelope settings
- Optional effects (reverb, delay, filter)

**SoundPack**: Modular sound collection
- Contains multiple Samples and Instruments
- Supports local and cloud storage
- Includes metadata (author, tags, version)

**Project**: Complete composition
- Global settings (tempo, time signature)
- References to loaded SoundPacks
- Array of Pads and Patterns
- Master volume control

**Pattern**: Sequence of pad triggers
- Step-based sequencing
- Configurable resolution (16th, 8th notes, etc.)
- Micro-timing offsets per trigger

### 2. Audio Engine (`@looppad/core/engine`)

**AudioEngine**: Core Web Audio management
- Initializes AudioContext with low-latency settings
- Manages sample loading and decoding
- Handles voice triggering with ADSR envelopes
- Implements voice stealing when polyphony limit reached
- Sub-10ms latency through optimized buffer sizing

**Transport**: Playback timing and scheduling
- Precise tempo-based scheduling
- Look-ahead scheduling (100ms window)
- Quantization to grid
- Loop support

**VoicePool**: Polyphonic voice allocation
- Pre-allocated voice pool (32+ voices)
- Multiple stealing strategies (oldest, quietest, nearest-release)
- Priority-based allocation

**SoundLoader**: Asset management
- Fetch from URLs or local storage
- IndexedDB caching for offline use
- Memory cache for performance
- Progressive loading support

### 3. UI Layer (`@looppad/web`)

**Design System**: EDM-inspired dark theme
- Vibrant accent colors (cyan, magenta, yellow)
- 16 distinct pad colors
- Consistent spacing and typography
- Glow effects for active states

**Components**:
- `PadGrid`: 8-16 pad matrix with visual feedback
- `Transport`: Playback controls (play, stop, record, tempo)
- `SoundPackSelector`: Browse and load sound packs

**Hooks**:
- `useAudioEngine`: React integration with AudioEngine lifecycle

## Latency Optimization

Target: **Sub-10ms latency**

Strategies:
1. **Interactive latency hint**: `latencyHint: 'interactive'`
2. **Small buffer size**: 128 samples (~2.9ms @ 44.1kHz)
3. **Look-ahead scheduling**: Schedule events 100ms ahead
4. **Voice pooling**: Pre-allocate voices to avoid allocation overhead
5. **Minimal audio graph**: Direct connections without unnecessary nodes

## Polyphony

Target: **32+ simultaneous voices**

Implementation:
- Pre-allocated VoicePool with 32 voice slots
- Voice stealing with configurable strategies
- Active voice tracking and cleanup
- Efficient node reuse

## Storage Strategy

**Offline Support**:
- IndexedDB for cached audio samples
- Service worker for offline app loading
- Local project storage

**Cloud Support**:
- RESTful API for sound pack library
- User account for project sync
- CDN for sample delivery

## Extensibility

**Modular Sound Packs**:
- JSON manifest with sample references
- Versioning support
- Custom metadata (author, tags, description)
- Hot-swappable during playback

**Effects Chain** (future):
- Pluggable effect modules
- Per-instrument or master effects
- Web Audio nodes for DSP

**Pattern System**:
- Multiple patterns per project
- Pattern chaining
- Arrangement view

## Performance Considerations

1. **Audio Thread Priority**: Web Audio runs on high-priority thread
2. **Main Thread Offload**: Minimize work on main thread during playback
3. **Memory Management**: Clear inactive voices, limit cache size
4. **Asset Preloading**: Load samples before playback starts
5. **Quantization**: Reduces timing jitter by snapping to grid

## Browser Compatibility

**Requirements**:
- Web Audio API support (Chrome 35+, Firefox 25+, Safari 14.1+, Edge 79+)
- ES2022 features
- IndexedDB for offline storage

**Fallbacks**:
- Feature detection for Web Audio API
- Graceful degradation for older browsers
- Warning messages for unsupported features
