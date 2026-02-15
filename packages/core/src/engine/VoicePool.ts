/**
 * VoicePool - Manages polyphonic voice allocation
 * Ensures efficient voice management with 32+ simultaneous voices
 */

export interface PoolConfig {
  maxVoices: number;
  stealingStrategy: 'oldest' | 'quietest' | 'nearest-release';
}

export interface PoolVoice {
  id: string;
  active: boolean;
  priority: number;
  startTime: number;
  amplitude: number;
}

export class VoicePool {
  private config: PoolConfig;
  private voices: Map<string, PoolVoice> = new Map();
  private availableVoices: Set<string> = new Set();

  constructor(config?: Partial<PoolConfig>) {
    this.config = {
      maxVoices: 32,
      stealingStrategy: 'oldest',
      ...config,
    };

    // Initialize voice pool
    for (let i = 0; i < this.config.maxVoices; i++) {
      const voiceId = `voice-${i}`;
      this.voices.set(voiceId, {
        id: voiceId,
        active: false,
        priority: 0,
        startTime: 0,
        amplitude: 0,
      });
      this.availableVoices.add(voiceId);
    }
  }

  /**
   * Allocate a voice for playback
   */
  allocate(priority: number = 0): string | null {
    // Try to get an available voice
    if (this.availableVoices.size > 0) {
      const voiceId = this.availableVoices.values().next().value as string;
      this.availableVoices.delete(voiceId);
      
      const voice = this.voices.get(voiceId);
      if (voice) {
        voice.active = true;
        voice.priority = priority;
        voice.startTime = Date.now();
        voice.amplitude = 1.0;
      }
      
      return voiceId;
    }

    // No available voices, steal one
    return this.stealVoice(priority);
  }

  /**
   * Release a voice back to the pool
   */
  release(voiceId: string): void {
    const voice = this.voices.get(voiceId);
    if (voice && voice.active) {
      voice.active = false;
      voice.priority = 0;
      this.availableVoices.add(voiceId);
    }
  }

  /**
   * Get number of active voices
   */
  getActiveCount(): number {
    return this.config.maxVoices - this.availableVoices.size;
  }

  /**
   * Check if pool has available voices
   */
  hasAvailable(): boolean {
    return this.availableVoices.size > 0;
  }

  /**
   * Steal a voice based on configured strategy
   */
  private stealVoice(newPriority: number): string | null {
    let victimId: string | null = null;
    let victimScore = Infinity;

    this.voices.forEach((voice, id) => {
      if (!voice.active) return;

      let score: number;
      switch (this.config.stealingStrategy) {
        case 'oldest':
          score = voice.startTime;
          break;
        case 'quietest':
          score = voice.amplitude * 1000 + voice.priority;
          break;
        case 'nearest-release':
          score = Date.now() - voice.startTime;
          break;
        default:
          score = voice.startTime;
      }

      // Consider priority
      if (voice.priority >= newPriority) {
        score += 10000; // Less likely to steal high priority voices
      }

      if (score < victimScore) {
        victimScore = score;
        victimId = id;
      }
    });

    if (victimId) {
      this.release(victimId);
      return this.allocate(newPriority);
    }

    return null;
  }

  /**
   * Reset pool state
   */
  reset(): void {
    this.voices.forEach((voice) => {
      voice.active = false;
      voice.priority = 0;
    });
    this.availableVoices.clear();
    for (let i = 0; i < this.config.maxVoices; i++) {
      this.availableVoices.add(`voice-${i}`);
    }
  }
}
