/**
 * AudioEngine Implementation
 * Core audio processing using Web Audio API
 */

import type {
  IAudioEngine,
  Instrument,
  PadState,
  AudioEngineError,
  InstrumentLoadError,
  PadNotFoundError,
} from '@echoforge/shared-types';

export class AudioEngine implements IAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private instruments = new Map<string, AudioBuffer>();
  private pads = new Map<string, PadState>();
  private activeSources = new Map<string, AudioBufferSourceNode>();

  async initialize(): Promise<void> {
    if (this.audioContext) {
      return;
    }

    try {
      this.audioContext = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.8;

      // Resume context if suspended (required on some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      throw new Error(`Failed to initialize audio engine: ${error}`);
    }
  }

  async loadInstrument(instrument: Instrument): Promise<string> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized');
    }

    try {
      if (instrument.settings.type === 'sampler') {
        const response = await fetch(instrument.settings.source);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.instruments.set(instrument.id, audioBuffer);
      } else {
        // Synth instruments are generated on-demand
        console.log('Synth instrument loaded:', instrument.id);
      }

      return instrument.id;
    } catch (error) {
      throw new Error(`Failed to load instrument ${instrument.id}: ${error}`);
    }
  }

  triggerPad(padId: string, velocity: number = 1): void {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('Audio engine not initialized');
    }

    const pad = this.pads.get(padId);
    if (!pad) {
      throw new Error(`Pad not found: ${padId}`);
    }

    if (pad.isMuted || !pad.isActive) {
      return;
    }

    // Stop existing source if in one-shot mode
    if (pad.playbackMode === 'oneShot') {
      this.stopPad(padId);
    }

    const buffer = this.instruments.get(pad.instrumentId);
    if (!buffer) {
      console.warn(`Instrument not loaded: ${pad.instrumentId}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = pad.playbackMode === 'loop';

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = pad.volume * velocity;

    // Create panner for stereo positioning
    const pannerNode = this.audioContext.createStereoPanner();
    pannerNode.pan.value = pad.pan;

    // Apply pitch shift
    if (pad.pitch !== 0) {
      source.playbackRate.value = Math.pow(2, pad.pitch / 12);
    }

    // Apply detune if specified
    if (pad.detune) {
      source.detune.value = pad.detune;
    }

    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterGain);

    // Start playback
    source.start();
    this.activeSources.set(padId, source);

    // Clean up on end
    source.onended = () => {
      this.activeSources.delete(padId);
    };
  }

  stopPad(padId: string): void {
    const source = this.activeSources.get(padId);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSources.delete(padId);
    }
  }

  updatePadState(padId: string, updates: Partial<PadState>): void {
    const pad = this.pads.get(padId);
    if (!pad) {
      throw new Error(`Pad not found: ${padId}`);
    }

    // Update pad state
    Object.assign(pad, updates);
    this.pads.set(padId, pad);

    // Apply real-time updates to active source
    const source = this.activeSources.get(padId);
    if (source && this.audioContext) {
      // Note: Some parameters can't be changed on active sources
      // They will take effect on next trigger
    }
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain) {
      throw new Error('Audio engine not initialized');
    }
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  getLatency(): number {
    if (!this.audioContext) {
      return 0;
    }
    return (this.audioContext.baseLatency || 0) * 1000;
  }

  dispose(): void {
    // Stop all active sources
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeSources.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGain = null;
    this.instruments.clear();
    this.pads.clear();
  }

  /**
   * Register a pad with the engine
   */
  registerPad(pad: PadState): void {
    this.pads.set(pad.id, pad);
  }

  /**
   * Unregister a pad from the engine
   */
  unregisterPad(padId: string): void {
    this.stopPad(padId);
    this.pads.delete(padId);
  }
}
