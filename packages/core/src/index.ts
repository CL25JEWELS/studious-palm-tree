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

// Pad state and controller
export interface PadState {
  id: number;
  active: boolean;
  volume: number;
  sample?: string;
}

export class PadController {
  private pads: Map<number, PadState> = new Map();
  private readonly padCount: number = 16;

  constructor() {
    // Initialize 16 pads (4x4 grid)
    for (let i = 0; i < this.padCount; i++) {
      this.pads.set(i, {
        id: i,
        active: false,
        volume: 0.8,
        sample: undefined
      });
    }
  }

  getPad(id: number): PadState | undefined {
    return this.pads.get(id);
  }

  getAllPads(): PadState[] {
    return Array.from(this.pads.values());
  }

  togglePad(id: number): boolean {
    const pad = this.pads.get(id);
    if (!pad) return false;
    
    pad.active = !pad.active;
    return pad.active;
  }

  setVolume(id: number, volume: number): boolean {
    const pad = this.pads.get(id);
    if (!pad) return false;
    
    // Clamp volume between 0 and 1
    pad.volume = Math.max(0, Math.min(1, volume));
    return true;
  }

  setSample(id: number, sample: string): boolean {
    const pad = this.pads.get(id);
    if (!pad) return false;
    
    pad.sample = sample;
    return true;
  }

  reset(): void {
    this.pads.forEach(pad => {
      pad.active = false;
      pad.volume = 0.8;
      pad.sample = undefined;
    });
  }
}

// Transport for timing and BPM
export interface TransportState {
  bpm: number;
  playing: boolean;
  position: number;
}

export class Transport {
  private state: TransportState = {
    bpm: 120,
    playing: false,
    position: 0
  };

  getBPM(): number {
    return this.state.bpm;
  }

  setBPM(bpm: number): void {
    // Clamp BPM between reasonable values
    this.state.bpm = Math.max(40, Math.min(240, bpm));
  }

  play(): void {
    this.state.playing = true;
  }

  stop(): void {
    this.state.playing = false;
    this.state.position = 0;
  }

  pause(): void {
    this.state.playing = false;
  }

  isPlaying(): boolean {
    return this.state.playing;
  }

  getPosition(): number {
    return this.state.position;
  }

  getState(): Readonly<TransportState> {
    return { ...this.state };
  }
}

// Project management
export interface Project {
  id: string;
  name: string;
  bpm: number;
  pads: PadState[];
  createdAt: string;
  updatedAt: string;
}

export class ProjectManager {
  private readonly storageKey = 'looppad_projects';

  saveProject(project: Project): boolean {
    try {
      const projects = this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      project.updatedAt = new Date().toISOString();
      
      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(projects));
      }
      return true;
    } catch {
      return false;
    }
  }

  loadProject(id: string): Project | null {
    try {
      const projects = this.getAllProjects();
      return projects.find(p => p.id === id) || null;
    } catch {
      return null;
    }
  }

  deleteProject(id: string): boolean {
    try {
      const projects = this.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  }

  getAllProjects(): Project[] {
    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  createProject(name: string, bpm: number = 120): Project {
    const now = new Date().toISOString();
    return {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      bpm,
      pads: [],
      createdAt: now,
      updatedAt: now
    };
  }
}
