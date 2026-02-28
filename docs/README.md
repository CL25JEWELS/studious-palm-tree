# LoopPad MVP Documentation

This directory contains the complete MVP architecture documentation for the LoopPad application.

## Documentation Overview

### 📐 [Architecture](./architecture.md)
Complete system architecture with ASCII diagrams showing:
- System architecture overview
- Data flow diagrams
- Module boundaries and responsibilities
- Performance considerations

### 🔧 [Module Boundaries](./module-boundaries.md)
Detailed specification of each module including:
- Public API surface
- Dependencies and dependency graph
- Internal (private) implementations
- Usage examples for each module
- Integration guidelines
- Testing boundaries

### 📘 [Examples](./examples.md)
Practical code examples demonstrating:
- Basic usage of each module
- Error handling patterns
- Complete integration examples
- Best practices

## Core Data Models

All TypeScript interfaces and types are defined in `packages/core/src/types.ts`:

### Primary Interfaces
- **PadState**: Represents a single pad in the grid
- **Instrument**: Playable sound/instrument definition
- **SoundPack**: Collection of related instruments
- **Project**: Complete project state
- **UserSession**: User authentication and preferences

### Configuration Types
- **AudioEngineConfig**: Audio engine initialization
- **PadControllerConfig**: Pad grid configuration
- **TransportConfig**: Transport/timing configuration
- **StorageConfig**: Storage backend configuration

### State Types
- **TransportState**: Current playback state
- **Pattern**: Recorded pattern data
- **NoteEvent**: Individual note in a pattern

## Error Contracts

All error classes are defined in `packages/core/src/errors.ts`:

### Error Classes
- **LoopPadError**: Base error class for all errors
- **AudioEngineError**: Audio-related errors
- **PadControllerError**: Pad interaction errors
- **TransportError**: Transport/timing errors
- **ProjectManagerError**: Project management errors
- **SoundPackServiceError**: Sound pack loading errors
- **StorageServiceError**: Storage/persistence errors

### Error Handling
Each error includes:
- `code`: Unique error code for programmatic handling
- `message`: Technical error message
- `userMessage`: User-friendly message for UI
- `context`: Additional error context

See [Examples](./examples.md#error-handling) for error handling patterns.

## Module Structure

```
packages/core/src/
├── index.ts              # Main exports
├── types.ts              # All TypeScript interfaces
├── errors.ts             # Error contracts
├── engine/
│   ├── AudioEngine.ts    # Core audio engine
│   └── Transport.ts      # Timing and sequencing
├── controllers/
│   └── PadController.ts  # Pad grid management
├── managers/
│   └── ProjectManager.ts # Project lifecycle
└── services/
    ├── SoundPackService.ts  # Sound pack loading
    └── StorageService.ts    # Data persistence
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Core Package

```bash
cd packages/core
npm run build
```

### 3. Import Types and Classes

```typescript
import {
  // Core Classes
  AudioEngine,
  
  // Types
  PadState,
  Instrument,
  SoundPack,
  Project,
  UserSession,
  
  // Configuration
  AudioEngineConfig,
  PadControllerConfig,
  TransportConfig,
  StorageConfig,
  
  // Errors
  AudioEngineError,
  PadControllerError,
  ErrorFactories,
} from '@looppad/core';
```

### 4. Initialize the System

```typescript
// 1. Create audio engine
const engine = new AudioEngine({
  sampleRate: 48000,
  bufferSize: 128,
});

// 2. Start from user interaction
document.addEventListener('click', () => {
  engine.start();
}, { once: true });

// 3. Use other modules (see examples for details)
```

## Design Principles

### 1. **Type Safety**
All data models are strongly typed with TypeScript interfaces for compile-time safety.

### 2. **Error Handling**
Consistent error handling with typed error classes and user-friendly messages.

### 3. **Module Boundaries**
Clear separation of concerns with well-defined module responsibilities.

### 4. **Dependency Direction**
Dependencies flow from high-level (UI) to low-level (audio), avoiding circular dependencies.

### 5. **Performance**
Optimized for real-time audio with <10ms latency and efficient state management.

## Development Workflow

### Adding New Features

1. **Define Types**: Add interfaces to `types.ts`
2. **Define Errors**: Add error classes to `errors.ts`
3. **Implement Module**: Create implementation in appropriate directory
4. **Export**: Add exports to `index.ts`
5. **Document**: Update relevant documentation
6. **Test**: Write unit and integration tests

### Testing Strategy

- **Unit Tests**: Test modules in isolation with mocked dependencies
- **Integration Tests**: Test modules working together
- **Error Tests**: Verify all error codes are thrown correctly

### Build and Deploy

```bash
# Build all packages
npm run build

# Run tests (when test infrastructure is set up)
npm test

# Type check
npx tsc --noEmit
```

## API Stability

This is an MVP (Minimum Viable Product) architecture. APIs may change based on feedback and requirements.

### Current Version: 1.0.0

- ✅ Core type definitions stable
- ✅ Error contracts stable
- ⚠️ Module implementations pending
- ⚠️ Public APIs subject to change

## Contributing

When contributing to the architecture:

1. **Maintain backward compatibility** where possible
2. **Document all breaking changes**
3. **Update examples** when APIs change
4. **Keep type definitions comprehensive**
5. **Follow established error handling patterns**

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

## Support

For questions or issues:
1. Check [Examples](./examples.md) for common patterns
2. Review [Module Boundaries](./module-boundaries.md) for API details
3. See [Architecture](./architecture.md) for system design

---

**Last Updated**: 2026-02-17  
**Status**: MVP Definition Complete ✅
