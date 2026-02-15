/**
 * Core data model types for EchoForge
 */

/**
 * Filter settings for audio processing
 */
export interface FilterSettings {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  cutoff: number; // Hz (20..20000)
  resonance: number; // Q (0.1..20)
}

/**
 * Note sequence for recorded patterns
 */
export interface NoteSequence {
  notes: Array<{
    time: number; // seconds from start
    duration: number; // seconds
    velocity: number; // 0..1
  }>;
  length: number; // total sequence length in seconds
}

/**
 * Pad state - fundamental unit representing a single pad
 */
export interface PadState {
  id: string;
  instrumentId: string;
  volume: number; // 0..1
  pitch: number; // semitones offset (-12..12)
  detune?: number; // cents (-100..100)
  filter?: FilterSettings;
  pan: number; // -1 (left) .. 1 (right)
  effectsChain: string[]; // effect instance IDs
  isActive: boolean;
  isMuted: boolean;
  isSolo: boolean;
  recordedSequence?: NoteSequence;
  playbackMode: 'oneShot' | 'loop' | 'hold';
  quantize: boolean;
  color?: string; // UI hint
}

/**
 * Sampler-based instrument settings
 */
export interface SamplerSettings {
  type: 'sampler';
  source: string; // URL or local path
  format: 'wav' | 'mp3' | 'ogg';
  sampleRate: number;
  bitDepth?: number;
  loopStart?: number; // seconds
  loopEnd?: number; // seconds
  attackTime: number; // seconds
  releaseTime: number; // seconds
}

/**
 * Synthesizer instrument settings
 */
export interface SynthSettings {
  type: 'synth';
  oscillatorType: 'sine' | 'square' | 'sawtooth' | 'triangle';
  envelope: {
    attack: number; // seconds
    decay: number; // seconds
    sustain: number; // 0..1
    release: number; // seconds
  };
  filterEnvelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    baseFrequency: number;
    octaves: number;
  };
}

/**
 * Instrument settings union type
 */
export type InstrumentSettings = SamplerSettings | SynthSettings;

/**
 * Instrument - represents a sound source
 */
export interface Instrument {
  id: string;
  name: string;
  type: 'sampler' | 'synth';
  soundPackId: string;
  settings: InstrumentSettings;
}

/**
 * Sound pack - collection of instruments
 */
export interface SoundPack {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  instruments: Instrument[];
  tags: string[];
  coverImage?: string;
  previewUrl?: string;
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'proprietary';
  isDownloaded: boolean;
  sizeBytes?: number;
}

/**
 * Sound pack metadata (lightweight version)
 */
export interface SoundPackMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  tags: string[];
  coverImage?: string;
  previewUrl?: string;
  sizeBytes: number;
}

/**
 * Effect settings types
 */
export interface ReverbSettings {
  type: 'reverb';
  decay: number; // seconds
  preDelay: number; // seconds
  wetDryMix: number; // 0..1
}

export interface DelaySettings {
  type: 'delay';
  delayTime: number; // seconds
  feedback: number; // 0..1
  wetDryMix: number; // 0..1
}

export interface ChorusSettings {
  type: 'chorus';
  rate: number; // Hz
  depth: number; // 0..1
  wetDryMix: number; // 0..1
}

export interface DistortionSettings {
  type: 'distortion';
  amount: number; // 0..1
  tone: number; // 0..1
}

export interface CompressorSettings {
  type: 'compressor';
  threshold: number; // dB
  ratio: number; // 1..20
  attack: number; // seconds
  release: number; // seconds
}

export interface EQSettings {
  type: 'eq';
  bands: Array<{
    frequency: number; // Hz
    gain: number; // dB
    q: number; // 0.1..10
  }>;
}

/**
 * Effect settings union type
 */
export type EffectSettings =
  | ReverbSettings
  | DelaySettings
  | ChorusSettings
  | DistortionSettings
  | CompressorSettings
  | EQSettings;

/**
 * Effect instance
 */
export interface EffectInstance {
  id: string;
  type: 'reverb' | 'delay' | 'chorus' | 'distortion' | 'compressor' | 'eq';
  settings: EffectSettings;
  bypass: boolean;
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  description?: string;
  tags: string[];
  isPublic: boolean;
  remixOf?: string; // parent project ID
  collaborators?: string[]; // user IDs
  thumbnailUrl?: string;
  duration?: number; // seconds
}

/**
 * Project - top-level container for a composition
 */
export interface Project {
  id: string;
  name: string;
  author: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  bpm: number; // 60..300
  signature: { numerator: number; denominator: number }; // e.g., 4/4
  pads: PadState[];
  soundPackIds: string[];
  effects: EffectInstance[];
  masterVolume: number; // 0..1
  masterEffects: string[]; // effect instance IDs
  metadata: ProjectMetadata;
}

/**
 * Transport state
 */
export type TransportState = 'playing' | 'stopped' | 'paused';

/**
 * Transport events
 */
export type TransportEvent = 'start' | 'stop' | 'pause' | 'beat' | 'measure';
