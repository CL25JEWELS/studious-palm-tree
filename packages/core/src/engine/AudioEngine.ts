/**
 * AudioEngine - Core Web Audio API engine with low-latency playback
 * Manages audio context, voice pooling, and sound triggering
 */

import type {
  AudioConfig,
  Voice,
  Instrument,
  Sample,
  UUID,
} from '../models/index.js';

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private voices: Map<UUID, Voice> = new Map();
  private samples: Map<UUID, AudioBuffer> = new Map();
  private instruments: Map<UUID, Instrument> = new Map();
  private config: AudioConfig;
  private nextVoiceId = 0;

  constructor(config?: Partial<AudioConfig>) {
    this.config = {
      sampleRate: 44100,
      latency: 'interactive', // Optimized for sub-10ms latency
      maxVoices: 32,
      bufferSize: 128,
      ...config,
    };
  }

  /**
   * Initialize the audio context
   * Must be called in response to user interaction
   */
  async initialize(): Promise<void> {
    if (this.context) {
      return;
    }

    this.context = new AudioContext({
      latencyHint: this.config.latency,
      sampleRate: this.config.sampleRate,
    });

    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 1.0;

    // Resume context if suspended (browser autoplay policy)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Load a sound sample from URL or ArrayBuffer
   */
  async loadSample(sample: Sample): Promise<void> {
    if (!this.context) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      let arrayBuffer: ArrayBuffer;

      if (sample.buffer) {
        // Already decoded
        this.samples.set(sample.id, sample.buffer);
        return;
      }

      // Fetch from URL
      const response = await fetch(sample.url);
      arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.samples.set(sample.id, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sample ${sample.name}:`, error);
      throw error;
    }
  }

  /**
   * Register an instrument for playback
   */
  registerInstrument(instrument: Instrument): void {
    this.instruments.set(instrument.id, instrument);
  }

  /**
   * Trigger a sound with optional scheduled time
   * Returns voice ID for tracking
   */
  trigger(
    instrumentId: UUID,
    velocity: number = 1.0,
    scheduledTime?: number
  ): UUID | null {
    if (!this.context || !this.masterGain) {
      console.warn('AudioEngine not initialized');
      return null;
    }

    const instrument = this.instruments.get(instrumentId);
    if (!instrument) {
      console.warn(`Instrument ${instrumentId} not found`);
      return null;
    }

    const buffer = this.samples.get(instrument.sampleId);
    if (!buffer) {
      console.warn(`Sample ${instrument.sampleId} not loaded`);
      return null;
    }

    // Clean up inactive voices
    this.cleanupVoices();

    // Check voice limit
    if (this.voices.size >= this.config.maxVoices) {
      this.stealOldestVoice();
    }

    // Create voice
    const voiceId = `voice-${this.nextVoiceId++}` as UUID;
    const startTime = scheduledTime ?? this.context.currentTime;

    // Create audio nodes
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Apply pitch shift
    source.playbackRate.value = Math.pow(2, instrument.pitch / 12);

    // Create gain node for envelope
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;

    // Connect: source -> gain -> master -> destination
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Apply ADSR envelope
    const now = startTime;
    const attackTime = instrument.attack;
    const decayTime = instrument.decay;
    const sustainLevel = instrument.sustain * instrument.volume * velocity;
    const releaseTime = instrument.release;

    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(
      instrument.volume * velocity,
      now + attackTime
    );

    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(
      sustainLevel,
      now + attackTime + decayTime
    );

    // Start playback
    source.start(startTime);

    // Schedule release and cleanup
    const duration = buffer.duration / source.playbackRate.value;
    const releaseStartTime = now + duration;
    gainNode.gain.setValueAtTime(gainNode.gain.value, releaseStartTime);
    gainNode.gain.linearRampToValueAtTime(0, releaseStartTime + releaseTime);

    source.stop(releaseStartTime + releaseTime + 0.1);

    // Store voice
    const voice: Voice = {
      id: voiceId,
      instrumentId,
      startTime,
      source,
      gainNode,
      active: true,
    };

    this.voices.set(voiceId, voice);

    // Cleanup on end
    source.onended = () => {
      const v = this.voices.get(voiceId);
      if (v) {
        v.active = false;
        v.source = null;
        v.gainNode = null;
      }
    };

    return voiceId;
  }

  /**
   * Stop a specific voice
   */
  stopVoice(voiceId: UUID): void {
    const voice = this.voices.get(voiceId);
    if (voice && voice.source && voice.active) {
      try {
        voice.source.stop();
        voice.active = false;
      } catch (error) {
        // Voice already stopped
      }
    }
  }

  /**
   * Stop all playing voices
   */
  stopAll(): void {
    this.voices.forEach((voice) => {
      if (voice.source && voice.active) {
        try {
          voice.source.stop();
        } catch (error) {
          // Voice already stopped
        }
      }
    });
    this.voices.clear();
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current audio context time
   */
  getCurrentTime(): number {
    return this.context?.currentTime ?? 0;
  }

  /**
   * Get audio context state
   */
  getState(): AudioContextState | null {
    return this.context?.state ?? null;
  }

  /**
   * Clean up inactive voices
   */
  private cleanupVoices(): void {
    const toRemove: UUID[] = [];
    this.voices.forEach((voice, id) => {
      if (!voice.active) {
        toRemove.push(id);
      }
    });
    toRemove.forEach((id) => this.voices.delete(id));
  }

  /**
   * Voice stealing: stop oldest voice when limit reached
   */
  private stealOldestVoice(): void {
    let oldest: Voice | null = null;
    let oldestId: UUID | null = null;

    this.voices.forEach((voice, id) => {
      if (!oldest || voice.startTime < oldest.startTime) {
        oldest = voice;
        oldestId = id;
      }
    });

    if (oldestId) {
      this.stopVoice(oldestId);
      this.voices.delete(oldestId);
    }
  }

  /**
   * Clean up and release resources
   */
  async dispose(): Promise<void> {
    this.stopAll();
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    this.masterGain = null;
    this.samples.clear();
    this.instruments.clear();
  }
}
