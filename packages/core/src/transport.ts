/**
 * Transport Implementation
 * Controls playback timing and synchronization
 */

import type { ITransport, TransportEvent, TransportState } from '@echoforge/shared-types';

export class Transport implements ITransport {
  private state: TransportState = 'stopped';
  private bpm: number = 120;
  private timeSignature = { numerator: 4, denominator: 4 };
  private currentTime: number = 0;
  private quantizationEnabled: boolean = true;
  private eventListeners = new Map<TransportEvent, Set<() => void>>();
  private scheduledEvents = new Map<number, (() => void)[]>();
  private intervalId: number | null = null;

  start(): void {
    if (this.state === 'playing') {
      return;
    }

    this.state = 'playing';
    this.emit('start');
    this.startClock();
  }

  stop(): void {
    if (this.state === 'stopped') {
      return;
    }

    this.state = 'stopped';
    this.currentTime = 0;
    this.stopClock();
    this.emit('stop');
  }

  pause(): void {
    if (this.state !== 'playing') {
      return;
    }

    this.state = 'paused';
    this.stopClock();
    this.emit('pause');
  }

  getState(): TransportState {
    return this.state;
  }

  setBPM(bpm: number): void {
    if (bpm < 60 || bpm > 300) {
      throw new Error('BPM must be between 60 and 300');
    }
    this.bpm = bpm;
  }

  getBPM(): number {
    return this.bpm;
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.timeSignature = { numerator, denominator };
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  scheduleAt(time: number, callback: () => void): void {
    const events = this.scheduledEvents.get(time) || [];
    events.push(callback);
    this.scheduledEvents.set(time, events);
  }

  setQuantization(enabled: boolean): void {
    this.quantizationEnabled = enabled;
  }

  on(event: TransportEvent, callback: () => void): void {
    const listeners = this.eventListeners.get(event) || new Set();
    listeners.add(callback);
    this.eventListeners.set(event, listeners);
  }

  /**
   * Get the duration of one beat in seconds
   */
  getBeatDuration(): number {
    return 60 / this.bpm;
  }

  /**
   * Get the duration of one measure in seconds
   */
  getMeasureDuration(): number {
    return this.getBeatDuration() * this.timeSignature.numerator;
  }

  /**
   * Quantize a time to the nearest beat
   */
  quantizeTime(time: number): number {
    if (!this.quantizationEnabled) {
      return time;
    }

    const beatDuration = this.getBeatDuration();
    return Math.round(time / beatDuration) * beatDuration;
  }

  private startClock(): void {
    const updateInterval = 10; // Update every 10ms
    let lastUpdate = Date.now();

    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdate) / 1000;
      lastUpdate = now;

      this.currentTime += elapsed;

      // Check for beat events
      const beatDuration = this.getBeatDuration();
      const currentBeat = Math.floor(this.currentTime / beatDuration);
      const previousBeat = Math.floor((this.currentTime - elapsed) / beatDuration);

      if (currentBeat !== previousBeat) {
        this.emit('beat');

        // Check for measure events
        const beatsPerMeasure = this.timeSignature.numerator;
        if (currentBeat % beatsPerMeasure === 0) {
          this.emit('measure');
        }
      }

      // Execute scheduled events
      this.executeScheduledEvents(this.currentTime);
    }, updateInterval);
  }

  private stopClock(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private executeScheduledEvents(time: number): void {
    // Execute events scheduled for this time or earlier
    const timesToExecute: number[] = [];

    this.scheduledEvents.forEach((events, scheduledTime) => {
      if (scheduledTime <= time) {
        events.forEach((callback) => callback());
        timesToExecute.push(scheduledTime);
      }
    });

    // Clean up executed events
    timesToExecute.forEach((time) => this.scheduledEvents.delete(time));
  }

  private emit(event: TransportEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback());
    }
  }
}
