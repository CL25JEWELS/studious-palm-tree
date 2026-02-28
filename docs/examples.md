# LoopPad API Usage Examples

This document provides practical examples of how to use the LoopPad core modules.

## Table of Contents
- [AudioEngine](#audioengine)
- [PadController](#padcontroller)
- [Transport](#transport)
- [ProjectManager](#projectmanager)
- [SoundPackService](#soundpackservice)
- [StorageService](#storageservice)
- [Error Handling](#error-handling)

---

## AudioEngine

The `AudioEngine` manages the Web Audio API context and master output.

### Basic Initialization

```typescript
import { AudioEngine, AudioEngineConfig } from '@looppad/core';

// Create engine with default settings
const engine = new AudioEngine();

// Or with custom configuration
const config: AudioEngineConfig = {
  sampleRate: 48000,
  bufferSize: 256,
  logger: console,
};
const customEngine = new AudioEngine(config);

// Start the audio engine (must be called from user interaction)
button.addEventListener('click', () => {
  engine.start();
});
```

### With Error Handling

```typescript
import { AudioEngine, AudioEngineError, ErrorFactories } from '@looppad/core';

const engine = new AudioEngine();

try {
  engine.start();
} catch (error) {
  if (error instanceof AudioEngineError) {
    console.error('Engine error:', error.code);
    console.error('User message:', error.userMessage);
    // Show error.userMessage to user in UI
  }
}
```

---

## PadController

The `PadController` manages the pad grid and handles user interactions.

### Creating a Pad Grid

```typescript
import { 
  PadController, 
  PadControllerConfig, 
  PadState,
  Instrument 
} from '@looppad/core';

// Initialize pad controller
const padConfig: PadControllerConfig = {
  rows: 4,
  columns: 4,
  audioEngine: engine,
  colorPalette: [
    '#00d9ff', '#ff00ea', '#ffea00', '#00ff88',
    '#ff6b00', '#9d00ff', '#00ffff', '#ff0055',
  ],
};

const padController = new PadController(padConfig);

// Get a specific pad state
const padState: PadState = padController.getPadState('pad-0-0');
console.log('Pad info:', {
  id: padState.id,
  isPlaying: padState.isPlaying,
  color: padState.color,
});
```

### Assigning Instruments and Triggering Pads

```typescript
// Assign an instrument to a pad
const kickDrum: Instrument = {
  id: 'kick-001',
  name: 'Kick Drum',
  packId: 'hiphop-pack-1',
  type: 'drum',
  buffer: audioBuffer, // AudioBuffer loaded elsewhere
  url: '/sounds/kick.wav',
};

padController.setPadInstrument('pad-0-0', kickDrum);

// Trigger the pad to play
padController.triggerPad('pad-0-0');

// Clear a pad
padController.clearPad('pad-0-0');
```

### With Error Handling

```typescript
import { PadControllerError, ErrorFactories } from '@looppad/core';

try {
  padController.triggerPad('pad-0-0');
} catch (error) {
  if (error instanceof PadControllerError) {
    if (error.code === 'INSTRUMENT_NOT_ASSIGNED') {
      console.log('No instrument on this pad');
      // Show instrument picker UI
    }
  }
}
```

---

## Transport

The `Transport` controls timing, BPM, and playback state.

### Basic Transport Control

```typescript
import { Transport, TransportConfig, TransportState } from '@looppad/core';

// Initialize transport
const transportConfig: TransportConfig = {
  bpm: 120,
  timeSignature: [4, 4],
  audioEngine: engine,
};

const transport = new Transport(transportConfig);

// Start playback
transport.play();

// Stop playback
transport.stop();

// Change BPM
transport.setBPM(140);

// Get current state
const state: TransportState = transport.getState();
console.log('Transport state:', {
  isPlaying: state.isPlaying,
  bpm: state.bpm,
  currentBeat: state.currentBeat,
});
```

### Loop Control

```typescript
// Enable looping
transport.setLoop(true, 0, 16); // Loop between beat 0 and 16

// Get current position
const currentTime = transport.getCurrentTime();
console.log('Current beat:', currentTime);
```

### With Error Handling

```typescript
import { TransportError, ErrorFactories } from '@looppad/core';

try {
  transport.setBPM(500); // Invalid BPM
} catch (error) {
  if (error instanceof TransportError) {
    if (error.code === 'INVALID_BPM') {
      console.error(error.userMessage); // "BPM must be between 20 and 300."
    }
  }
}
```

---

## ProjectManager

The `ProjectManager` handles project lifecycle and persistence.

### Creating and Managing Projects

```typescript
import { ProjectManager, Project } from '@looppad/core';

// Initialize project manager
const projectManager = new ProjectManager({
  storage: storageService,
  padController: padController,
  transport: transport,
});

// Create a new project
const project: Project = await projectManager.createProject('My Beat');
console.log('Created project:', project.id);

// Save current project
await projectManager.saveProject();

// Load an existing project
await projectManager.loadProject('project-123');

// Export project as JSON
const projectData = await projectManager.exportProject();
console.log('Project data:', projectData);
```

### Auto-save Functionality

```typescript
// Enable auto-save every 30 seconds
projectManager.enableAutoSave(30000);

// Disable auto-save
projectManager.disableAutoSave();

// Check if project has unsaved changes
if (projectManager.getCurrentProject()?.isDirty) {
  console.log('Project has unsaved changes');
}
```

### With Error Handling

```typescript
import { ProjectManagerError, ErrorFactories } from '@looppad/core';

try {
  await projectManager.loadProject('invalid-id');
} catch (error) {
  if (error instanceof ProjectManagerError) {
    if (error.code === 'PROJECT_NOT_FOUND') {
      console.error('Project not found');
      // Redirect to project list
    } else if (error.code === 'PROJECT_LOAD_FAILED') {
      console.error('Failed to load:', error.context);
      // Show retry option
    }
  }
}
```

---

## SoundPackService

The `SoundPackService` handles loading and managing sound packs.

### Loading Sound Packs

```typescript
import { SoundPackService, SoundPack, Instrument } from '@looppad/core';

// Initialize service
const soundPackService = new SoundPackService({
  audioEngine: engine,
  cacheEnabled: true,
});

// Load a sound pack
const pack: SoundPack = await soundPackService.loadSoundPack('hiphop-essentials');
console.log('Loaded pack:', pack.name);
console.log('Instruments:', pack.instruments.length);

// Get available packs
const availablePacks = await soundPackService.getAvailablePacks();
console.log('Available packs:', availablePacks.map(p => p.name));

// Get instruments from a pack
const instruments = soundPackService.getInstruments('hiphop-essentials');
console.log('First instrument:', instruments[0].name);
```

### Preloading and Caching

```typescript
// Preload multiple packs
const packs = ['hiphop-essentials', 'edm-basics', 'trap-drums'];
await Promise.all(packs.map(id => soundPackService.loadSoundPack(id)));

// Check if pack is loaded
if (soundPackService.isPackLoaded('hiphop-essentials')) {
  console.log('Pack is ready to use');
}

// Unload a pack to free memory
soundPackService.unloadSoundPack('trap-drums');
```

### With Error Handling

```typescript
import { SoundPackServiceError, ErrorFactories } from '@looppad/core';

try {
  await soundPackService.loadSoundPack('invalid-pack');
} catch (error) {
  if (error instanceof SoundPackServiceError) {
    if (error.code === 'PACK_NOT_FOUND') {
      console.error('Pack does not exist');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Check your internet connection');
      // Show retry button
    }
  }
}
```

---

## StorageService

The `StorageService` provides data persistence across sessions.

### Basic Storage Operations

```typescript
import { StorageService, StorageConfig } from '@looppad/core';

// Initialize with localStorage
const storageConfig: StorageConfig = {
  backend: 'localStorage',
  namespace: 'looppad',
};

const storage = new StorageService(storageConfig);

// Save data
await storage.save('user-preferences', {
  theme: 'dark',
  masterVolume: 0.8,
});

// Load data
const preferences = await storage.load('user-preferences');
console.log('Theme:', preferences.theme);

// Delete data
await storage.delete('old-project');

// List all keys
const keys = await storage.list();
console.log('Stored items:', keys);
```

### Cloud Sync

```typescript
// Initialize with cloud backend
const cloudConfig: StorageConfig = {
  backend: 'cloud',
  cloudEndpoint: 'https://api.looppad.io/v1',
  cloudCredentials: {
    apiKey: 'your-api-key',
    userId: 'user-123',
  },
};

const cloudStorage = new StorageService(cloudConfig);

// Save will automatically sync to cloud
await cloudStorage.save('project-data', projectData);

// Pull latest from cloud
await cloudStorage.sync();
```

### With Error Handling

```typescript
import { StorageServiceError, ErrorFactories } from '@looppad/core';

try {
  await storage.save('large-project', massiveData);
} catch (error) {
  if (error instanceof StorageServiceError) {
    if (error.code === 'QUOTA_EXCEEDED') {
      console.error('Storage full');
      // Show cleanup dialog
    } else if (error.code === 'STORAGE_NOT_AVAILABLE') {
      console.error('Storage not supported');
      // Fallback to in-memory only
    }
  }
}
```

---

## Error Handling

### Best Practices for Error Handling

```typescript
import {
  LoopPadError,
  AudioEngineError,
  PadControllerError,
  TransportError,
  ProjectManagerError,
  SoundPackServiceError,
  StorageServiceError,
  ErrorFactories,
} from '@looppad/core';

// Generic error handler
function handleError(error: unknown) {
  if (error instanceof LoopPadError) {
    // Log technical details
    console.error(`[${error.code}] ${error.message}`);
    console.error('Context:', error.context);
    
    // Show user-friendly message in UI
    showNotification(error.userMessage, 'error');
    
    // Handle specific errors
    switch (error.code) {
      case 'AUDIO_CONTEXT_NOT_STARTED':
        // Show "Click to start" prompt
        break;
      case 'QUOTA_EXCEEDED':
        // Show storage cleanup dialog
        break;
      case 'PROJECT_NOT_FOUND':
        // Redirect to project list
        break;
    }
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
    showNotification('An unexpected error occurred', 'error');
  }
}

// Example usage in an async function
async function loadAndPlay() {
  try {
    const pack = await soundPackService.loadSoundPack('edm-basics');
    const instrument = pack.instruments[0];
    padController.setPadInstrument('pad-0-0', instrument);
    padController.triggerPad('pad-0-0');
  } catch (error) {
    handleError(error);
  }
}
```

### Creating Custom Errors

```typescript
// Using error factories
throw ErrorFactories.projectNotFound('project-123');

// Creating errors directly
throw new AudioEngineError(
  'AUDIO_CONTEXT_INIT_FAILED',
  'Failed to initialize audio context: ' + reason,
  'Could not start audio. Please refresh the page.',
  { reason }
);
```

### Centralized Error Logging

```typescript
// Set up global error logger
class ErrorLogger {
  static log(error: LoopPadError) {
    // Send to analytics
    analytics.track('error', {
      code: error.code,
      message: error.message,
      context: error.context,
    });
    
    // Send to error tracking service
    errorTracker.capture(error);
  }
}

// Use in error handlers
function handleError(error: unknown) {
  if (error instanceof LoopPadError) {
    ErrorLogger.log(error);
    showNotification(error.userMessage, 'error');
  }
}
```

---

## Complete Example: Building a Simple Beat

Here's a complete example that ties everything together:

```typescript
import {
  AudioEngine,
  PadController,
  Transport,
  ProjectManager,
  SoundPackService,
  StorageService,
  ErrorFactories,
} from '@looppad/core';

async function initializeLoopPad() {
  try {
    // 1. Initialize core services
    const engine = new AudioEngine({ sampleRate: 48000 });
    const storage = new StorageService({ backend: 'localStorage' });
    const transport = new Transport({
      bpm: 120,
      timeSignature: [4, 4],
      audioEngine: engine,
    });
    
    // 2. Set up pad controller
    const padController = new PadController({
      rows: 4,
      columns: 4,
      audioEngine: engine,
    });
    
    // 3. Load sound pack
    const soundPackService = new SoundPackService({ audioEngine: engine });
    const pack = await soundPackService.loadSoundPack('trap-drums');
    
    // 4. Assign instruments to pads
    pack.instruments.slice(0, 16).forEach((instrument, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      padController.setPadInstrument(`pad-${row}-${col}`, instrument);
    });
    
    // 5. Create and save project
    const projectManager = new ProjectManager({
      storage,
      padController,
      transport,
    });
    
    const project = await projectManager.createProject('My First Beat');
    
    // 6. Start audio (from user interaction)
    document.getElementById('start-btn')?.addEventListener('click', () => {
      engine.start();
      transport.play();
    });
    
    // 7. Wire up pad triggers
    document.querySelectorAll('.pad').forEach((element, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const padId = `pad-${row}-${col}`;
      
      element.addEventListener('click', () => {
        padController.triggerPad(padId);
      });
    });
    
    console.log('LoopPad initialized successfully!');
    
  } catch (error) {
    console.error('Failed to initialize:', error);
    throw error;
  }
}

// Initialize on page load
initializeLoopPad();
```
