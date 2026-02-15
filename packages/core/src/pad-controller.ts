/**
 * PadController Implementation
 * Manages pad state and routing
 */

import type { IPadController, PadState } from '@echoforge/shared-types';

export class PadController implements IPadController {
  private pads = new Map<string, PadState>();
  private subscribers = new Set<(pads: PadState[]) => void>();

  createPad(config: Partial<PadState>): PadState {
    const pad: PadState = {
      id: config.id || this.generateId(),
      instrumentId: config.instrumentId || '',
      volume: config.volume ?? 0.8,
      pitch: config.pitch ?? 0,
      detune: config.detune,
      filter: config.filter,
      pan: config.pan ?? 0,
      effectsChain: config.effectsChain || [],
      isActive: config.isActive ?? true,
      isMuted: config.isMuted ?? false,
      isSolo: config.isSolo ?? false,
      recordedSequence: config.recordedSequence,
      playbackMode: config.playbackMode || 'oneShot',
      quantize: config.quantize ?? false,
      color: config.color,
    };

    this.pads.set(pad.id, pad);
    this.notifySubscribers();
    return pad;
  }

  getPad(padId: string): PadState | null {
    return this.pads.get(padId) || null;
  }

  updatePad(padId: string, updates: Partial<PadState>): void {
    const pad = this.pads.get(padId);
    if (!pad) {
      throw new Error(`Pad not found: ${padId}`);
    }

    Object.assign(pad, updates);
    this.pads.set(padId, pad);
    this.notifySubscribers();
  }

  deletePad(padId: string): void {
    this.pads.delete(padId);
    this.notifySubscribers();
  }

  getAllPads(): PadState[] {
    return Array.from(this.pads.values());
  }

  subscribe(callback: (pads: PadState[]) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const pads = this.getAllPads();
    this.subscribers.forEach((callback) => callback(pads));
  }

  private generateId(): string {
    return `pad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
