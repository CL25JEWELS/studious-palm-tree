import { Result } from '../types/Result';
import { LoopPadError } from '../errors/BaseError';

/**
 * Audio engine module interface
 * Responsible for Web Audio API context management and audio processing
 */
export interface IAudioEngine {
  /**
   * Initialize the audio context
   * Must be called from user interaction due to browser autoplay policies
   */
  initialize(): Result<void, LoopPadError>;

  /**
   * Start audio processing
   */
  start(): Result<void, LoopPadError>;

  /**
   * Stop audio processing
   */
  stop(): Result<void, LoopPadError>;

  /**
   * Get current audio context state
   */
  getState(): 'suspended' | 'running' | 'closed' | 'uninitialized';

  /**
   * Get current time from audio context
   */
  getCurrentTime(): number;

  /**
   * Get audio context sample rate
   */
  getSampleRate(): number;
}

/**
 * Transport module interface
 * Responsible for playback timing, tempo, and transport control
 */
export interface ITransport {
  /**
   * Start playback from current position
   */
  start(): Result<void, LoopPadError>;

  /**
   * Stop playback
   */
  stop(): Result<void, LoopPadError>;

  /**
   * Pause playback (maintains position)
   */
  pause(): Result<void, LoopPadError>;

  /**
   * Seek to a specific time position
   */
  seek(timeInSeconds: number): Result<void, LoopPadError>;

  /**
   * Get current playback position
   */
  getPosition(): number;

  /**
   * Set tempo in beats per minute
   */
  setTempo(bpm: number): Result<void, LoopPadError>;

  /**
   * Get current tempo
   */
  getTempo(): number;

  /**
   * Schedule a callback at a specific time
   */
  schedule(time: number, callback: () => void): Result<string, LoopPadError>;

  /**
   * Cancel a scheduled callback
   */
  cancelScheduled(id: string): Result<void, LoopPadError>;
}

/**
 * Sound loader module interface
 * Responsible for loading and managing audio buffers
 */
export interface ISoundLoader {
  /**
   * Load an audio file from URL
   */
  load(url: string): Promise<Result<AudioBuffer, LoopPadError>>;

  /**
   * Load multiple audio files
   */
  loadBatch(urls: string[]): Promise<Result<Map<string, AudioBuffer>, LoopPadError>>;

  /**
   * Get a loaded buffer by URL
   */
  getBuffer(url: string): Result<AudioBuffer, LoopPadError>;

  /**
   * Check if a buffer is loaded
   */
  isLoaded(url: string): boolean;

  /**
   * Unload a buffer to free memory
   */
  unload(url: string): Result<void, LoopPadError>;

  /**
   * Clear all loaded buffers
   */
  clear(): void;
}

/**
 * Voice pool module interface
 * Responsible for polyphonic voice allocation and management
 */
export interface IVoicePool {
  /**
   * Allocate a voice for playback
   */
  allocate(): Result<IVoice, LoopPadError>;

  /**
   * Release a voice back to the pool
   */
  release(voice: IVoice): void;

  /**
   * Get number of available voices
   */
  getAvailableCount(): number;

  /**
   * Get total voice count
   */
  getTotalCount(): number;

  /**
   * Stop all active voices
   */
  stopAll(): void;
}

/**
 * Voice interface
 * Represents a single voice for audio playback
 */
export interface IVoice {
  readonly id: string;
  
  /**
   * Trigger voice with audio buffer
   */
  trigger(buffer: AudioBuffer, options?: VoiceTriggerOptions): Result<void, LoopPadError>;

  /**
   * Stop the voice
   */
  stop(time?: number): void;

  /**
   * Check if voice is currently playing
   */
  isPlaying(): boolean;

  /**
   * Set voice volume (0.0 to 1.0)
   */
  setVolume(volume: number): void;

  /**
   * Set voice pan (-1.0 to 1.0)
   */
  setPan(pan: number): void;
}

export interface VoiceTriggerOptions {
  volume?: number;
  pan?: number;
  startTime?: number;
  loop?: boolean;
}

/**
 * Effects processor module interface
 * Responsible for applying audio effects
 */
export interface IEffectsProcessor {
  /**
   * Add an effect to the chain
   */
  addEffect(effect: IAudioEffect): Result<string, LoopPadError>;

  /**
   * Remove an effect from the chain
   */
  removeEffect(effectId: string): Result<void, LoopPadError>;

  /**
   * Get an effect by ID
   */
  getEffect(effectId: string): Result<IAudioEffect, LoopPadError>;

  /**
   * Bypass all effects
   */
  bypass(bypass: boolean): void;

  /**
   * Connect processor to audio destination
   */
  connect(destination: AudioNode): void;

  /**
   * Disconnect processor
   */
  disconnect(): void;
}

/**
 * Audio effect interface
 * Base interface for all audio effects
 */
export interface IAudioEffect {
  readonly id: string;
  readonly type: string;

  /**
   * Get the audio node for this effect
   */
  getNode(): AudioNode;

  /**
   * Set a parameter value
   */
  setParameter(name: string, value: number): Result<void, LoopPadError>;

  /**
   * Get a parameter value
   */
  getParameter(name: string): Result<number, LoopPadError>;

  /**
   * Bypass the effect
   */
  bypass(bypass: boolean): void;
}

/**
 * Mixer module interface
 * Responsible for mixing multiple audio tracks
 */
export interface IMixer {
  /**
   * Create a new track
   */
  createTrack(name: string): Result<ITrack, LoopPadError>;

  /**
   * Get a track by ID
   */
  getTrack(trackId: string): Result<ITrack, LoopPadError>;

  /**
   * Remove a track
   */
  removeTrack(trackId: string): Result<void, LoopPadError>;

  /**
   * Get all tracks
   */
  getTracks(): ITrack[];

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void;

  /**
   * Get master volume
   */
  getMasterVolume(): number;
}

/**
 * Track interface
 * Represents a single audio track in the mixer
 */
export interface ITrack {
  readonly id: string;
  readonly name: string;

  /**
   * Set track volume (0.0 to 1.0)
   */
  setVolume(volume: number): void;

  /**
   * Get track volume
   */
  getVolume(): number;

  /**
   * Mute/unmute track
   */
  setMute(mute: boolean): void;

  /**
   * Check if track is muted
   */
  isMuted(): boolean;

  /**
   * Solo track (mutes all other tracks)
   */
  setSolo(solo: boolean): void;

  /**
   * Check if track is soloed
   */
  isSoloed(): boolean;

  /**
   * Set track pan (-1.0 to 1.0)
   */
  setPan(pan: number): void;

  /**
   * Get track pan
   */
  getPan(): number;

  /**
   * Get the audio node for this track
   */
  getNode(): AudioNode;
}
