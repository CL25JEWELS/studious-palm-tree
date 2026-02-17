// Core audio engine exports
export const version = '1.0.0';

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

// Export PadController
export {
  PadController,
  type PadState,
  type PadControllerConfig,
} from './PadController';

// Export Transport
export {
  Transport,
  type TransportConfig,
  type TransportState,
  type TransportEventType,
  type TransportListener,
} from './Transport';

// Export ProjectManager
export {
  ProjectManager,
  type ProjectMetadata,
  type ProjectData,
  type ProjectManagerConfig,
} from './ProjectManager';
