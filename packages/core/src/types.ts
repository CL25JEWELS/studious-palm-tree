/**
 * Core type definitions for LoopPad MVP
 * 
 * This file contains all the primary data models and interfaces
 * used across the application.
 */

// ============================================================================
// Pad State
// ============================================================================

/**
 * Represents the current state of a single pad in the grid
 */
export interface PadState {
  /** Unique identifier for this pad (e.g., "pad-0-0") */
  id: string;
  
  /** Row index in the pad grid (0-indexed) */
  row: number;
  
  /** Column index in the pad grid (0-indexed) */
  column: number;
  
  /** The instrument assigned to this pad, if any */
  instrument: Instrument | null;
  
  /** Whether this pad is currently playing */
  isPlaying: boolean;
  
  /** Whether this pad is currently recording */
  isRecording: boolean;
  
  /** Whether this pad is armed for recording */
  isArmed: boolean;
  
  /** Visual color for this pad (hex string, e.g., "#00d9ff") */
  color: string;
  
  /** Pad-specific volume (0.0 to 1.0) */
  volume: number;
  
  /** Pad-specific pan (-1.0 to 1.0, where -1 is left, 1 is right) */
  pan: number;
  
  /** Optional recorded pattern for this pad */
  pattern?: Pattern;
}

/**
 * Recorded pattern data for a pad
 */
export interface Pattern {
  /** Unique pattern identifier */
  id: string;
  
  /** Pattern duration in beats */
  lengthInBeats: number;
  
  /** Array of note events in this pattern */
  notes: NoteEvent[];
  
  /** When this pattern was created */
  createdAt: Date;
  
  /** When this pattern was last modified */
  modifiedAt: Date;
}

/**
 * A single note event in a pattern
 */
export interface NoteEvent {
  /** Time offset in beats from pattern start */
  time: number;
  
  /** MIDI note number (0-127) */
  note: number;
  
  /** Note velocity (0.0 to 1.0) */
  velocity: number;
  
  /** Note duration in beats */
  duration: number;
}

// ============================================================================
// Instrument
// ============================================================================

/**
 * Represents a playable instrument/sound
 */
export interface Instrument {
  /** Unique instrument identifier */
  id: string;
  
  /** Human-readable instrument name */
  name: string;
  
  /** The sound pack this instrument belongs to */
  packId: string;
  
  /** Type of instrument */
  type: InstrumentType;
  
  /** Audio buffer data (loaded asynchronously) */
  buffer: AudioBuffer | null;
  
  /** URL to load the audio from */
  url: string;
  
  /** Optional instrument metadata */
  metadata?: InstrumentMetadata;
}

/**
 * Types of instruments supported
 */
export type InstrumentType = 
  | 'drum'        // Drum hits (kick, snare, hi-hat, etc.)
  | 'bass'        // Bass sounds
  | 'synth'       // Synthesizer sounds
  | 'vocal'       // Vocal samples
  | 'fx'          // Sound effects
  | 'melodic';    // Melodic instruments (keys, leads, etc.)

/**
 * Optional metadata for an instrument
 */
export interface InstrumentMetadata {
  /** Original key/note of the sample */
  rootNote?: number;
  
  /** BPM of the original sample (for loops) */
  bpm?: number;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Author/creator of the sound */
  author?: string;
  
  /** License information */
  license?: string;
}

// ============================================================================
// Sound Pack
// ============================================================================

/**
 * A collection of related instruments
 */
export interface SoundPack {
  /** Unique sound pack identifier */
  id: string;
  
  /** Display name for this pack */
  name: string;
  
  /** Pack description */
  description: string;
  
  /** Genre or category (e.g., "Hip Hop", "EDM", "Trap") */
  genre: string;
  
  /** Array of instruments in this pack */
  instruments: Instrument[];
  
  /** URL to pack thumbnail/cover art */
  coverArtUrl?: string;
  
  /** Pack author/creator */
  author?: string;
  
  /** Pack version */
  version: string;
  
  /** When this pack was created */
  createdAt: Date;
  
  /** Total size in bytes */
  sizeBytes?: number;
  
  /** Whether this pack is currently loaded */
  isLoaded: boolean;
}

// ============================================================================
// Project
// ============================================================================

/**
 * A complete LoopPad project containing all state
 */
export interface Project {
  /** Unique project identifier */
  id: string;
  
  /** Project name */
  name: string;
  
  /** Project description */
  description?: string;
  
  /** User who created this project */
  userId: string;
  
  /** Tempo in beats per minute */
  bpm: number;
  
  /** Time signature numerator (e.g., 4 in 4/4) */
  timeSignatureNumerator: number;
  
  /** Time signature denominator (e.g., 4 in 4/4) */
  timeSignatureDenominator: number;
  
  /** Master volume (0.0 to 1.0) */
  masterVolume: number;
  
  /** Array of all pad states in this project */
  pads: PadState[];
  
  /** IDs of sound packs used in this project */
  soundPackIds: string[];
  
  /** Project creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  modifiedAt: Date;
  
  /** Last saved timestamp */
  lastSaved?: Date;
  
  /** Whether this project has unsaved changes */
  isDirty: boolean;
  
  /** Project tags for organization */
  tags?: string[];
  
  /** Project visibility (for social features) */
  visibility: ProjectVisibility;
}

/**
 * Project visibility options
 */
export type ProjectVisibility = 'private' | 'unlisted' | 'public';

// ============================================================================
// User Session
// ============================================================================

/**
 * Current user session state
 */
export interface UserSession {
  /** Unique user identifier */
  userId: string;
  
  /** User display name */
  username: string;
  
  /** User email address */
  email?: string;
  
  /** Authentication token */
  authToken: string;
  
  /** When this session was created */
  sessionCreatedAt: Date;
  
  /** When this session expires */
  sessionExpiresAt: Date;
  
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  
  /** User preferences */
  preferences: UserPreferences;
  
  /** Current project ID, if any is open */
  currentProjectId?: string;
  
  /** IDs of user's favorite sound packs */
  favoriteSoundPacks: string[];
  
  /** IDs of user's recent projects */
  recentProjects: string[];
}

/**
 * User-specific preferences
 */
export interface UserPreferences {
  /** UI theme ('light' or 'dark') */
  theme: 'light' | 'dark';
  
  /** Default BPM for new projects */
  defaultBpm: number;
  
  /** Default time signature for new projects */
  defaultTimeSignature: [number, number];
  
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval: number;
  
  /** Master volume preference (0.0 to 1.0) */
  masterVolume: number;
  
  /** Whether to enable metronome by default */
  metronomeEnabled: boolean;
  
  /** MIDI input device ID, if any */
  midiInputDevice?: string;
  
  /** Keyboard layout for pad triggering */
  keyboardLayout: KeyboardLayout;
}

/**
 * Keyboard layout options
 */
export type KeyboardLayout = 'qwerty' | 'azerty' | 'dvorak';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for AudioEngine initialization
 */
export interface AudioEngineConfig {
  /** Sample rate (default: 44100) */
  sampleRate?: number;
  
  /** Buffer size in samples (default: 128) */
  bufferSize?: number;
  
  /** Optional logger for debugging */
  logger?: {
    log: (message?: any, ...optionalParams: any[]) => void;
  };
}

/**
 * Configuration for PadController
 */
export interface PadControllerConfig {
  /** Number of rows in the pad grid */
  rows: number;
  
  /** Number of columns in the pad grid */
  columns: number;
  
  /** Reference to the AudioEngine instance */
  audioEngine: any; // Will be typed as AudioEngine when imported
  
  /** Optional color palette for pads */
  colorPalette?: string[];
}

/**
 * Configuration for Transport
 */
export interface TransportConfig {
  /** Initial BPM */
  bpm: number;
  
  /** Time signature [numerator, denominator] */
  timeSignature: [number, number];
  
  /** Reference to the AudioEngine instance */
  audioEngine: any; // Will be typed as AudioEngine when imported
}

/**
 * Configuration for StorageService
 */
export interface StorageConfig {
  /** Storage backend to use */
  backend: 'localStorage' | 'indexedDB' | 'cloud';
  
  /** Namespace prefix for keys */
  namespace?: string;
  
  /** Cloud API endpoint (if using cloud backend) */
  cloudEndpoint?: string;
  
  /** Cloud API credentials */
  cloudCredentials?: {
    apiKey: string;
    userId: string;
  };
}

// ============================================================================
// Transport State
// ============================================================================

/**
 * Current state of the transport/playback engine
 */
export interface TransportState {
  /** Whether transport is currently playing */
  isPlaying: boolean;
  
  /** Whether transport is currently recording */
  isRecording: boolean;
  
  /** Current BPM */
  bpm: number;
  
  /** Current time signature */
  timeSignature: [number, number];
  
  /** Current position in beats */
  currentBeat: number;
  
  /** Current bar number */
  currentBar: number;
  
  /** Whether loop is enabled */
  loopEnabled: boolean;
  
  /** Loop start point in beats */
  loopStart?: number;
  
  /** Loop end point in beats */
  loopEnd?: number;
}
