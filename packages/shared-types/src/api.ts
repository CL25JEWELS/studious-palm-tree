/**
 * API interfaces for EchoForge core modules
 */

import type {
  Instrument,
  PadState,
  Project,
  ProjectMetadata,
  TransportEvent,
  TransportState,
} from './models';

/**
 * Audio Engine API
 * Core audio processing engine using Web Audio API
 */
export interface IAudioEngine {
  /**
   * Initialize the audio context and engine
   * @throws {AudioEngineError} if initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Load an instrument into the engine
   * @param instrument Instrument configuration
   * @returns Loaded instrument ID
   * @throws {InstrumentLoadError} if loading fails
   */
  loadInstrument(instrument: Instrument): Promise<string>;

  /**
   * Trigger a pad to play
   * @param padId Pad identifier
   * @param velocity Note velocity (0..1)
   * @throws {PadNotFoundError} if pad doesn't exist
   */
  triggerPad(padId: string, velocity?: number): void;

  /**
   * Stop a playing pad
   * @param padId Pad identifier
   */
  stopPad(padId: string): void;

  /**
   * Update pad parameters in real-time
   * @param padId Pad identifier
   * @param updates Partial pad state updates
   */
  updatePadState(padId: string, updates: Partial<PadState>): void;

  /**
   * Set master volume
   * @param volume Volume level (0..1)
   */
  setMasterVolume(volume: number): void;

  /**
   * Get current audio latency
   * @returns Latency in milliseconds
   */
  getLatency(): number;

  /**
   * Clean up and release resources
   */
  dispose(): void;
}

/**
 * Pad Controller API
 * Manages pad state and routing
 */
export interface IPadController {
  /**
   * Create a new pad
   * @param config Initial pad configuration
   * @returns Created pad state
   */
  createPad(config: Partial<PadState>): PadState;

  /**
   * Get pad by ID
   * @param padId Pad identifier
   * @returns Pad state or null if not found
   */
  getPad(padId: string): PadState | null;

  /**
   * Update pad state
   * @param padId Pad identifier
   * @param updates Partial pad state updates
   */
  updatePad(padId: string, updates: Partial<PadState>): void;

  /**
   * Delete a pad
   * @param padId Pad identifier
   */
  deletePad(padId: string): void;

  /**
   * Get all pads
   * @returns Array of all pad states
   */
  getAllPads(): PadState[];

  /**
   * Subscribe to pad state changes
   * @param callback Function called on state change
   * @returns Unsubscribe function
   */
  subscribe(callback: (pads: PadState[]) => void): () => void;
}

/**
 * Transport API
 * Controls playback timing and synchronization
 */
export interface ITransport {
  /**
   * Start playback
   */
  start(): void;

  /**
   * Stop playback
   */
  stop(): void;

  /**
   * Pause playback (maintains position)
   */
  pause(): void;

  /**
   * Get current playback state
   */
  getState(): TransportState;

  /**
   * Set tempo
   * @param bpm Beats per minute (60..300)
   */
  setBPM(bpm: number): void;

  /**
   * Get current tempo
   */
  getBPM(): number;

  /**
   * Set time signature
   * @param numerator Beat count per measure
   * @param denominator Beat note value
   */
  setTimeSignature(numerator: number, denominator: number): void;

  /**
   * Get current playback position
   * @returns Position in seconds
   */
  getCurrentTime(): number;

  /**
   * Schedule an event at a specific time
   * @param time Time in seconds
   * @param callback Function to execute
   */
  scheduleAt(time: number, callback: () => void): void;

  /**
   * Enable/disable quantization
   * @param enabled Quantization state
   */
  setQuantization(enabled: boolean): void;

  /**
   * Subscribe to transport events
   * @param event Event type
   * @param callback Event handler
   */
  on(event: TransportEvent, callback: () => void): void;
}

/**
 * Project Manager API
 * Handles project persistence and synchronization
 */
export interface IProjectManager {
  /**
   * Create a new project
   * @param config Initial project configuration
   * @returns Created project
   */
  createProject(config: Partial<Project>): Promise<Project>;

  /**
   * Load a project by ID
   * @param projectId Project identifier
   * @returns Project or null if not found
   * @throws {ProjectLoadError} if loading fails
   */
  loadProject(projectId: string): Promise<Project | null>;

  /**
   * Save current project
   * @param project Project to save
   * @throws {ProjectSaveError} if saving fails
   */
  saveProject(project: Project): Promise<void>;

  /**
   * Export project to file
   * @param projectId Project identifier
   * @param format Export format
   * @returns Blob containing exported data
   */
  exportProject(projectId: string, format: 'json' | 'wav' | 'mp3'): Promise<Blob>;

  /**
   * Import project from file
   * @param data Project data
   * @returns Imported project
   * @throws {ProjectImportError} if import fails
   */
  importProject(data: Blob): Promise<Project>;

  /**
   * List all projects
   * @returns Array of project metadata
   */
  listProjects(): Promise<ProjectMetadata[]>;

  /**
   * Delete a project
   * @param projectId Project identifier
   */
  deleteProject(projectId: string): Promise<void>;

  /**
   * Sync project with cloud
   * @param projectId Project identifier
   * @throws {ProjectSyncError} if sync fails
   */
  syncToCloud(projectId: string): Promise<void>;
}
