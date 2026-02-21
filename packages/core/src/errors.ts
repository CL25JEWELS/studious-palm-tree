/**
 * Error contracts for LoopPad MVP
 * 
 * Defines custom error classes for each module with specific error codes
 * for programmatic handling.
 */

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for all LoopPad errors
 */
export class LoopPadError extends Error {
  /** Unique error code for programmatic handling */
  public readonly code: string;
  
  /** User-friendly error message */
  public readonly userMessage: string;
  
  /** Optional additional context */
  public readonly context?: Record<string, any>;
  
  constructor(
    code: string,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.userMessage = userMessage;
    this.context = context;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// ============================================================================
// AudioEngine Errors
// ============================================================================

export class AudioEngineError extends LoopPadError {
  constructor(
    code: AudioEngineErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type AudioEngineErrorCode =
  | 'AUDIO_CONTEXT_INIT_FAILED'
  | 'AUDIO_CONTEXT_SUSPENDED'
  | 'AUDIO_CONTEXT_NOT_STARTED'
  | 'BUFFER_CREATE_FAILED'
  | 'NODE_CONNECTION_FAILED'
  | 'SAMPLE_RATE_NOT_SUPPORTED';

// ============================================================================
// PadController Errors
// ============================================================================

export class PadControllerError extends LoopPadError {
  constructor(
    code: PadControllerErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type PadControllerErrorCode =
  | 'PAD_NOT_FOUND'
  | 'INVALID_PAD_ID'
  | 'INSTRUMENT_NOT_ASSIGNED'
  | 'PAD_ALREADY_PLAYING'
  | 'INVALID_PAD_COORDINATES';

// ============================================================================
// Transport Errors
// ============================================================================

export class TransportError extends LoopPadError {
  constructor(
    code: TransportErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type TransportErrorCode =
  | 'INVALID_BPM'
  | 'INVALID_TIME_SIGNATURE'
  | 'TRANSPORT_NOT_STARTED'
  | 'TRANSPORT_ALREADY_PLAYING'
  | 'SCHEDULER_ERROR';

// ============================================================================
// ProjectManager Errors
// ============================================================================

export class ProjectManagerError extends LoopPadError {
  constructor(
    code: ProjectManagerErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type ProjectManagerErrorCode =
  | 'PROJECT_NOT_FOUND'
  | 'PROJECT_LOAD_FAILED'
  | 'PROJECT_SAVE_FAILED'
  | 'INVALID_PROJECT_DATA'
  | 'PROJECT_NAME_REQUIRED'
  | 'PROJECT_ALREADY_EXISTS';

// ============================================================================
// SoundPackService Errors
// ============================================================================

export class SoundPackServiceError extends LoopPadError {
  constructor(
    code: SoundPackServiceErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type SoundPackServiceErrorCode =
  | 'PACK_NOT_FOUND'
  | 'PACK_LOAD_FAILED'
  | 'PACK_ALREADY_LOADED'
  | 'INVALID_PACK_DATA'
  | 'NETWORK_ERROR'
  | 'DECODE_ERROR';

// ============================================================================
// StorageService Errors
// ============================================================================

export class StorageServiceError extends LoopPadError {
  constructor(
    code: StorageServiceErrorCode,
    message: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    super(code, message, userMessage, context);
  }
}

export type StorageServiceErrorCode =
  | 'STORAGE_NOT_AVAILABLE'
  | 'QUOTA_EXCEEDED'
  | 'KEY_NOT_FOUND'
  | 'SERIALIZATION_ERROR'
  | 'DESERIALIZATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'CLOUD_SYNC_FAILED';

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Factory functions for creating common errors with preset messages
 */

export const ErrorFactories = {
  // AudioEngine
  audioContextNotStarted: () =>
    new AudioEngineError(
      'AUDIO_CONTEXT_NOT_STARTED',
      'Audio context has not been started',
      'Audio is not initialized. Please click anywhere to start.',
    ),
  
  audioContextSuspended: () =>
    new AudioEngineError(
      'AUDIO_CONTEXT_SUSPENDED',
      'Audio context is suspended',
      'Audio playback is paused. Click to resume.',
    ),
  
  // PadController
  padNotFound: (padId: string) =>
    new PadControllerError(
      'PAD_NOT_FOUND',
      `Pad with id ${padId} not found`,
      'The selected pad could not be found.',
      { padId },
    ),
  
  instrumentNotAssigned: (padId: string) =>
    new PadControllerError(
      'INSTRUMENT_NOT_ASSIGNED',
      `No instrument assigned to pad ${padId}`,
      'Please assign an instrument to this pad first.',
      { padId },
    ),
  
  // Transport
  invalidBPM: (bpm: number) =>
    new TransportError(
      'INVALID_BPM',
      `Invalid BPM value: ${bpm}`,
      'BPM must be between 20 and 300.',
      { bpm },
    ),
  
  // ProjectManager
  projectNotFound: (projectId: string) =>
    new ProjectManagerError(
      'PROJECT_NOT_FOUND',
      `Project ${projectId} not found`,
      'The project could not be found.',
      { projectId },
    ),
  
  projectSaveFailed: (reason: string) =>
    new ProjectManagerError(
      'PROJECT_SAVE_FAILED',
      `Failed to save project: ${reason}`,
      'Could not save your project. Please try again.',
      { reason },
    ),
  
  // SoundPackService
  packNotFound: (packId: string) =>
    new SoundPackServiceError(
      'PACK_NOT_FOUND',
      `Sound pack ${packId} not found`,
      'The sound pack could not be found.',
      { packId },
    ),
  
  packLoadFailed: (packId: string, reason: string) =>
    new SoundPackServiceError(
      'PACK_LOAD_FAILED',
      `Failed to load sound pack ${packId}: ${reason}`,
      'Could not load the sound pack. Please check your connection.',
      { packId, reason },
    ),
  
  // StorageService
  storageNotAvailable: () =>
    new StorageServiceError(
      'STORAGE_NOT_AVAILABLE',
      'Local storage is not available',
      'Storage is not available in your browser. Some features may not work.',
    ),
  
  quotaExceeded: () =>
    new StorageServiceError(
      'QUOTA_EXCEEDED',
      'Storage quota exceeded',
      'You have run out of storage space. Please delete some projects.',
    ),
  
  keyNotFound: (key: string) =>
    new StorageServiceError(
      'KEY_NOT_FOUND',
      `Key ${key} not found in storage`,
      'The requested data could not be found.',
      { key },
    ),
};
