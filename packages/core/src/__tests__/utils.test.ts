/**
 * Tests for utility functions
 */

import {
  generateId,
  clamp,
  lerp,
  midiToFreq,
  freqToMidi,
  dbToGain,
  gainToDb,
  formatTime,
  isWebAudioSupported,
} from '../utils/index';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('midiToFreq and freqToMidi', () => {
    it('should convert MIDI note 69 (A4) to 440Hz', () => {
      expect(midiToFreq(69)).toBeCloseTo(440, 1);
    });

    it('should convert 440Hz back to MIDI note 69', () => {
      expect(freqToMidi(440)).toBeCloseTo(69, 1);
    });

    it('should be reversible', () => {
      const note = 60;
      const freq = midiToFreq(note);
      expect(freqToMidi(freq)).toBeCloseTo(note, 1);
    });
  });

  describe('dbToGain and gainToDb', () => {
    it('should convert 0dB to gain of 1', () => {
      expect(dbToGain(0)).toBeCloseTo(1, 5);
    });

    it('should convert gain of 1 to 0dB', () => {
      expect(gainToDb(1)).toBeCloseTo(0, 5);
    });

    it('should handle -6dB correctly', () => {
      const gain = dbToGain(-6);
      expect(gain).toBeCloseTo(0.501, 2);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(0)).toBe('00:00.00');
      expect(formatTime(65.5)).toBe('01:05.50');
      expect(formatTime(125.25)).toBe('02:05.25');
    });
  });

  describe('isWebAudioSupported', () => {
    it('should return boolean', () => {
      expect(typeof isWebAudioSupported()).toBe('boolean');
    });
  });
});
