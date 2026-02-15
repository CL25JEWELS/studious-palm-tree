/**
 * Core data models for LoopPad drum machine/sampler
 * Defines the fundamental structure for audio playback, sound organization, and projects
 */

/**
 * Unique identifier type for type safety
 */
export type UUID = string;

/**
 * Audio sample with metadata
 */
export interface Sample {
  id: UUID;
  name: string;
  url: string;
  buffer?: AudioBuffer;
  duration: number;
  sampleRate: number;
}

/**
 * Pad represents a single trigger point in the drum machine
 * Typically mapped to keyboard keys or UI buttons
 */
export interface Pad {
  id: UUID;
  index: number; // 0-15 for 16-pad layout
  name: string;
  instrumentId: UUID | null;
  color: string; // Hex color for UI
  velocity: number; // 0-1, default hit velocity
  muted: boolean;
  solo: boolean;
}

/**
 * Instrument contains audio settings and effects for a sound
 */
export interface Instrument {
  id: UUID;
  name: string;
  sampleId: UUID;
  
  // Playback settings
  volume: number; // 0-1
  pan: number; // -1 (left) to 1 (right)
  pitch: number; // Semitones offset, -12 to +12
  
  // Envelope (ADSR)
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0-1
  release: number; // seconds
  
  // Effects
  reverb: number; // 0-1, wet/dry mix
  delay: number; // 0-1, wet/dry mix
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
    frequency: number; // Hz
    q: number; // Quality factor
  } | null;
}

/**
 * SoundPack is a modular collection of sounds that can be loaded/unloaded
 */
export interface SoundPack {
  id: UUID;
  name: string;
  description: string;
  author: string;
  version: string;
  
  // Pack metadata
  tags: string[];
  coverArtUrl?: string;
  
  // Sound content
  samples: Sample[];
  instruments: Instrument[];
  
  // Storage
  storageType: 'local' | 'cloud';
  lastModified: Date;
  size: number; // bytes
}

/**
 * Pattern represents a sequence of pad hits in time
 */
export interface Pattern {
  id: UUID;
  name: string;
  length: number; // in beats
  resolution: number; // steps per beat (16 = 16th notes)
  
  // Step data: array of steps, each containing pad triggers
  steps: PatternStep[];
}

/**
 * A single step in a pattern
 */
export interface PatternStep {
  index: number;
  triggers: PadTrigger[];
}

/**
 * A pad trigger event at a specific step
 */
export interface PadTrigger {
  padId: UUID;
  velocity: number; // 0-1
  offset: number; // Micro-timing offset in ms (-50 to +50)
}

/**
 * Project represents a complete composition
 */
export interface Project {
  id: UUID;
  name: string;
  author: string;
  createdAt: Date;
  modifiedAt: Date;
  
  // Global settings
  tempo: number; // BPM
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  
  // Content
  soundPackIds: UUID[]; // References to loaded sound packs
  pads: Pad[];
  patterns: Pattern[];
  
  // Master settings
  masterVolume: number; // 0-1
  
  // Quantization
  quantize: boolean;
  quantizeValue: number; // 1/16, 1/8, 1/4, etc. represented as fraction denominator
}

/**
 * Transport state for playback control
 */
export interface TransportState {
  playing: boolean;
  recording: boolean;
  tempo: number;
  position: number; // Current beat position
  loop: boolean;
  loopStart: number; // beat
  loopEnd: number; // beat
}

/**
 * Audio configuration for the engine
 */
export interface AudioConfig {
  sampleRate: number;
  latency: 'interactive' | 'balanced' | 'playback'; // Web Audio latency hint
  maxVoices: number; // Polyphony limit (32+ recommended)
  bufferSize: number; // Audio buffer size for processing
}

/**
 * Voice represents a single playing sound instance
 */
export interface Voice {
  id: UUID;
  instrumentId: UUID;
  startTime: number; // AudioContext time
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  active: boolean;
}
