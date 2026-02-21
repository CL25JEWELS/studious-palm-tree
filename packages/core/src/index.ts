/**
 * @looppad/core - Core Audio Engine
 * 
 * Public API Surface
 * 
 * This module exports the public-facing API for the LoopPad audio system.
 * For internal module interfaces and architecture, see ./internal/
 */

// Version
export const version = '1.0.0';

// ============================================================================
// Public API - Configuration Types
// ============================================================================

export interface AudioEngineConfig {
  sampleRate?: number;
  bufferSize?: number;
  /**
   * Optional logger used by the audio engine. If not provided, the engine
   * will remain silent and produce no console output.
   */
  logger?: {
    log: (message?: any, ...optionalParams: any[]) => void;
  };
}

// ============================================================================
// Public API - Core Classes
// ============================================================================

export class AudioEngine {
  private readonly logger?: {
    log: (message?: any, ...optionalParams: any[]) => void;
  };

  constructor(config?: AudioEngineConfig) {
    this.logger = config?.logger;
    // Only log when a logger is explicitly provided; avoid leaking full config.
    this.logger?.log('AudioEngine initialized');
  }

  start() {
    this.logger?.log('AudioEngine started');
  }

  stop() {
    this.logger?.log('AudioEngine stopped');
  }
}

// ============================================================================
// Public API - Error Types (Re-exported from internal)
// ============================================================================

export type {
  // Base error types
  BaseError,
  LoopPadError,
  
  // Specific error types
  AudioContextError,
  BufferLoadError,
  InvalidSampleRateError,
  TransportError,
  TimingError,
  ResourceNotFoundError,
  ResourceLimitError,
  ConfigValidationError,
} from './internal/errors/BaseError';

export {
  // Type guards
  isAudioContextError,
  isBufferLoadError,
  isInvalidSampleRateError,
  isTransportError,
  isTimingError,
  isResourceNotFoundError,
  isResourceLimitError,
  isConfigValidationError,
  
  // Error factories
  createAudioContextError,
  createBufferLoadError,
  createInvalidSampleRateError,
  createTransportError,
  createTimingError,
  createResourceNotFoundError,
  createResourceLimitError,
  createConfigValidationError,
} from './internal/errors/BaseError';

// ============================================================================
// Public API - Result Type
// ============================================================================

export type { Result } from './internal/types/Result';
export { success, failure, isSuccess, isFailure } from './internal/types/Result';

// ============================================================================
// Public API - Configuration Types (Re-exported from internal)
// ============================================================================

export type {
  LoopPadConfig,
  TransportConfig,
  VoicePoolConfig,
  SoundLoaderConfig,
  MixerConfig,
  ILogger,
} from './internal/types/Config';

// ============================================================================
// Public API - Module Interfaces (Re-exported from internal)
// ============================================================================

export type {
  IAudioEngine,
  ITransport,
  ISoundLoader,
  IVoicePool,
  IVoice,
  VoiceTriggerOptions,
  IEffectsProcessor,
  IAudioEffect,
  IMixer,
  ITrack,
} from './internal/modules/AudioModules';

// ============================================================================
// Note: Internal module implementations are not exported
// Consumers should use the interfaces and error types above
// ============================================================================
