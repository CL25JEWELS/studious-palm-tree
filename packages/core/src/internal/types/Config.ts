/**
 * Core configuration for the audio engine
 */
export interface AudioEngineConfig {
  /**
   * Sample rate for audio context (default: 44100)
   */
  sampleRate?: number;

  /**
   * Buffer size for audio processing (default: 128)
   * Lower values = lower latency but higher CPU usage
   */
  bufferSize?: number;

  /**
   * Latency hint for audio context
   */
  latencyHint?: 'interactive' | 'balanced' | 'playback';

  /**
   * Optional logger for debugging
   */
  logger?: ILogger;
}

/**
 * Transport configuration
 */
export interface TransportConfig {
  /**
   * Initial tempo in beats per minute (default: 120)
   */
  tempo?: number;

  /**
   * Time signature numerator (default: 4)
   */
  timeSignatureNumerator?: number;

  /**
   * Time signature denominator (default: 4)
   */
  timeSignatureDenominator?: number;

  /**
   * Whether to start in loop mode (default: false)
   */
  loop?: boolean;

  /**
   * Loop start time in seconds
   */
  loopStart?: number;

  /**
   * Loop end time in seconds
   */
  loopEnd?: number;
}

/**
 * Voice pool configuration
 */
export interface VoicePoolConfig {
  /**
   * Maximum number of concurrent voices (default: 32)
   */
  maxVoices?: number;

  /**
   * Voice stealing strategy when pool is full
   */
  stealingStrategy?: 'oldest' | 'quietest' | 'none';
}

/**
 * Sound loader configuration
 */
export interface SoundLoaderConfig {
  /**
   * Base URL for loading audio files
   */
  baseUrl?: string;

  /**
   * Maximum cache size in bytes
   */
  maxCacheSize?: number;

  /**
   * Whether to use caching
   */
  enableCache?: boolean;
}

/**
 * Mixer configuration
 */
export interface MixerConfig {
  /**
   * Maximum number of tracks (default: 16)
   */
  maxTracks?: number;

  /**
   * Master volume (0.0 to 1.0, default: 0.8)
   */
  masterVolume?: number;

  /**
   * Whether to enable auto-gain compensation
   */
  autoGain?: boolean;
}

/**
 * Logger interface for debugging and monitoring
 */
export interface ILogger {
  log(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Complete configuration for the loop pad system
 */
export interface LoopPadConfig {
  audio?: AudioEngineConfig;
  transport?: TransportConfig;
  voicePool?: VoicePoolConfig;
  soundLoader?: SoundLoaderConfig;
  mixer?: MixerConfig;
}
