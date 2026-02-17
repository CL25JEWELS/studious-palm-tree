/**
 * PadController - Manages individual pad state and playback
 */

export interface PadState {
  /** Unique identifier for the pad */
  id: number;
  /** Whether the pad is currently playing */
  isPlaying: boolean;
  /** Audio buffer or sample loaded into the pad */
  sample?: AudioBuffer;
  /** Volume level (0.0 - 1.0) */
  volume: number;
  /** Color assigned to this pad */
  color: string;
}

export interface PadControllerConfig {
  /** Number of pads to create (typically 16) */
  padCount?: number;
  /** Initial volume for all pads */
  defaultVolume?: number;
}

export class PadController {
  private pads: Map<number, PadState>;
  private readonly padCount: number;

  constructor(config?: PadControllerConfig) {
    this.padCount = config?.padCount ?? 16;
    this.pads = new Map();
    
    // Initialize pads
    for (let i = 0; i < this.padCount; i++) {
      this.pads.set(i, {
        id: i,
        isPlaying: false,
        volume: config?.defaultVolume ?? 0.8,
        color: this.getDefaultColor(i),
      });
    }
  }

  /**
   * Trigger a pad to start playing
   */
  triggerPad(padId: number): void {
    const pad = this.pads.get(padId);
    if (pad) {
      pad.isPlaying = true;
    }
  }

  /**
   * Stop a pad from playing
   */
  stopPad(padId: number): void {
    const pad = this.pads.get(padId);
    if (pad) {
      pad.isPlaying = false;
    }
  }

  /**
   * Load a sample into a pad
   */
  loadSample(padId: number, sample: AudioBuffer): void {
    const pad = this.pads.get(padId);
    if (pad) {
      pad.sample = sample;
    }
  }

  /**
   * Set volume for a specific pad
   */
  setVolume(padId: number, volume: number): void {
    const pad = this.pads.get(padId);
    if (pad) {
      pad.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get state of a specific pad
   */
  getPadState(padId: number): PadState | undefined {
    return this.pads.get(padId);
  }

  /**
   * Get all pad states
   */
  getAllPads(): PadState[] {
    return Array.from(this.pads.values());
  }

  private getDefaultColor(index: number): string {
    // Default color palette for 16 pads
    const colors = [
      '#00d9ff', '#ff00ea', '#ffea00', '#00ff88',
      '#ff6b00', '#8b00ff', '#00ffea', '#ff0055',
      '#88ff00', '#ff0088', '#00aaff', '#ffaa00',
      '#aa00ff', '#00ff55', '#ff5500', '#0055ff',
    ];
    return colors[index % colors.length];
  }
}
