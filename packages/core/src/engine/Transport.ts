/**
 * Transport - Handles playback timing, quantization, and scheduling
 */

import type { TransportState, Pattern } from '../models/index.js';
import type { AudioEngine } from './AudioEngine.js';

export class Transport {
  private state: TransportState;
  private audioEngine: AudioEngine;
  private currentPattern: Pattern | null = null;
  private schedulerIntervalId: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private scheduleAheadTime = 0.1; // Schedule 100ms ahead
  private stepDuration = 0;

  constructor(audioEngine: AudioEngine, initialTempo: number = 120) {
    this.audioEngine = audioEngine;
    this.state = {
      playing: false,
      recording: false,
      tempo: initialTempo,
      position: 0,
      loop: true,
      loopStart: 0,
      loopEnd: 4,
    };
    this.calculateStepDuration();
  }

  /**
   * Start playback
   */
  start(): void {
    if (this.state.playing) return;

    this.state.playing = true;
    this.currentStep = 0;
    this.nextStepTime = this.audioEngine.getCurrentTime();
    
    // Start scheduler
    this.schedulerIntervalId = window.setInterval(
      () => this.schedule(),
      25 // Check every 25ms
    );
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.state.playing = false;
    if (this.schedulerIntervalId !== null) {
      window.clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
    this.audioEngine.stopAll();
    this.currentStep = 0;
    this.state.position = 0;
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.state.playing = false;
    if (this.schedulerIntervalId !== null) {
      window.clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
  }

  /**
   * Set tempo in BPM
   */
  setTempo(bpm: number): void {
    this.state.tempo = Math.max(20, Math.min(300, bpm));
    this.calculateStepDuration();
  }

  /**
   * Set current pattern for playback
   */
  setPattern(pattern: Pattern): void {
    this.currentPattern = pattern;
    this.calculateStepDuration();
  }

  /**
   * Get current transport state
   */
  getState(): TransportState {
    return { ...this.state };
  }

  /**
   * Quantize a time value to the nearest step
   */
  quantizeTime(time: number, division: number = 16): number {
    const stepSize = (60 / this.state.tempo) / (division / 4);
    return Math.round(time / stepSize) * stepSize;
  }

  /**
   * Calculate step duration based on tempo and pattern resolution
   */
  private calculateStepDuration(): void {
    const beatsPerSecond = this.state.tempo / 60;
    const resolution = this.currentPattern?.resolution ?? 16;
    this.stepDuration = (1 / beatsPerSecond) / (resolution / 4);
  }

  /**
   * Scheduler loop - schedules notes ahead of time
   */
  private schedule(): void {
    if (!this.state.playing || !this.currentPattern) return;

    const currentTime = this.audioEngine.getCurrentTime();

    // Schedule all steps that fall within the schedule window
    while (this.nextStepTime < currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
  }

  /**
   * Schedule a single step for playback
   */
  private scheduleStep(stepIndex: number, _time: number): void {
    if (!this.currentPattern) return;

    const step = this.currentPattern.steps[stepIndex];
    if (!step) return;

    // Trigger all pads in this step
    step.triggers.forEach((_trigger) => {
      // Convert ms offset to seconds and schedule
      // const scheduledTime = time + (trigger.offset / 1000);
      // Note: In a real implementation, we'd look up the pad -> instrument mapping
      // and call: this.audioEngine.trigger(instrumentId, trigger.velocity, scheduledTime);
      // For now, we're just demonstrating the scheduling mechanism
    });

    // Update position
    const beatsPerStep = 4 / (this.currentPattern.resolution || 16);
    this.state.position = stepIndex * beatsPerStep;
  }

  /**
   * Advance to next step
   */
  private advanceStep(): void {
    if (!this.currentPattern) return;

    this.nextStepTime += this.stepDuration;
    this.currentStep++;

    // Loop back if at end
    if (this.currentStep >= this.currentPattern.steps.length) {
      if (this.state.loop) {
        this.currentStep = 0;
      } else {
        this.stop();
      }
    }
  }
}
