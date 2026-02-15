/**
 * Utility functions for LoopPad core
 */

import type { UUID } from '../models/index.js';

/**
 * Generate a UUID v4
 */
export function generateId(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Convert frequency to MIDI note number
 */
export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Decibels to linear gain
 */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Linear gain to decibels
 */
export function gainToDb(gain: number): number {
  return 20 * Math.log10(gain);
}

/**
 * Check if Web Audio API is supported
 */
export function isWebAudioSupported(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side or non-browser environment
  }
  return typeof AudioContext !== 'undefined' || 
         typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';
}

/**
 * Get optimal buffer size for low latency
 */
export function getOptimalBufferSize(): number {
  // Lower buffer = lower latency, but higher CPU
  // Target sub-10ms latency
  return 128; // ~2.9ms at 44.1kHz
}

/**
 * Format time in seconds to MM:SS.ms
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
