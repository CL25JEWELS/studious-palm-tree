/**
 * Transport - Controls playback timing and sequencing
 */

export interface TransportConfig {
  /** Beats per minute */
  bpm?: number;
  /** Time signature numerator (beats per bar) */
  beatsPerBar?: number;
  /** Whether to auto-start on creation */
  autoStart?: boolean;
}

export interface TransportState {
  /** Whether transport is currently playing */
  isPlaying: boolean;
  /** Current tempo in BPM */
  bpm: number;
  /** Current beat position */
  currentBeat: number;
  /** Current bar position */
  currentBar: number;
  /** Time signature */
  beatsPerBar: number;
}

export type TransportEventType = 'beat' | 'bar' | 'start' | 'stop';

export interface TransportListener {
  (event: TransportEventType, state: TransportState): void;
}

export class Transport {
  private state: TransportState;
  private listeners: Set<TransportListener>;
  private intervalId?: NodeJS.Timeout;

  constructor(config?: TransportConfig) {
    this.state = {
      isPlaying: false,
      bpm: config?.bpm ?? 120,
      currentBeat: 0,
      currentBar: 0,
      beatsPerBar: config?.beatsPerBar ?? 4,
    };
    
    this.listeners = new Set();

    if (config?.autoStart) {
      this.start();
    }
  }

  /**
   * Start the transport
   */
  start(): void {
    if (this.state.isPlaying) {
      return;
    }

    this.state.isPlaying = true;
    this.state.currentBeat = 0;
    this.state.currentBar = 0;
    
    this.emit('start');
    this.scheduleNextBeat();
  }

  /**
   * Stop the transport
   */
  stop(): void {
    if (!this.state.isPlaying) {
      return;
    }

    this.state.isPlaying = false;
    
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.emit('stop');
  }

  /**
   * Set the tempo
   */
  setBPM(bpm: number): void {
    this.state.bpm = Math.max(20, Math.min(300, bpm));
  }

  /**
   * Get current transport state
   */
  getState(): TransportState {
    return { ...this.state };
  }

  /**
   * Register a listener for transport events
   */
  addListener(listener: TransportListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: TransportListener): void {
    this.listeners.delete(listener);
  }

  private scheduleNextBeat(): void {
    if (!this.state.isPlaying) {
      return;
    }

    const beatDuration = (60 / this.state.bpm) * 1000; // ms per beat
    
    this.intervalId = setTimeout(() => {
      this.state.currentBeat++;
      
      if (this.state.currentBeat >= this.state.beatsPerBar) {
        this.state.currentBeat = 0;
        this.state.currentBar++;
        this.emit('bar');
      }
      
      this.emit('beat');
      this.scheduleNextBeat();
    }, beatDuration);
  }

  private emit(event: TransportEventType): void {
    this.listeners.forEach(listener => {
      listener(event, this.getState());
    });
  }
}
