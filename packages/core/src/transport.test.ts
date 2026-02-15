import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Transport } from '../src/transport';

describe('Transport', () => {
  let transport: Transport;

  beforeEach(() => {
    transport = new Transport();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('state management', () => {
    it('should start in stopped state', () => {
      expect(transport.getState()).toBe('stopped');
    });

    it('should transition to playing state', () => {
      transport.start();
      expect(transport.getState()).toBe('playing');
    });

    it('should transition to paused state', () => {
      transport.start();
      transport.pause();
      expect(transport.getState()).toBe('paused');
    });

    it('should transition to stopped state', () => {
      transport.start();
      transport.stop();
      expect(transport.getState()).toBe('stopped');
    });
  });

  describe('BPM management', () => {
    it('should default to 120 BPM', () => {
      expect(transport.getBPM()).toBe(120);
    });

    it('should set BPM', () => {
      transport.setBPM(140);
      expect(transport.getBPM()).toBe(140);
    });

    it('should throw error for invalid BPM', () => {
      expect(() => transport.setBPM(50)).toThrow();
      expect(() => transport.setBPM(350)).toThrow();
    });
  });

  describe('time signature', () => {
    it('should set time signature', () => {
      transport.setTimeSignature(3, 4);
      expect(transport.getMeasureDuration()).toBeCloseTo(1.5, 2);
    });
  });

  describe('quantization', () => {
    it('should quantize time to nearest beat', () => {
      transport.setBPM(120); // 0.5s per beat

      const quantized = transport.quantizeTime(0.7);
      expect(quantized).toBeCloseTo(0.5, 2);
    });

    it('should not quantize when disabled', () => {
      transport.setQuantization(false);
      const time = 0.7;
      const quantized = transport.quantizeTime(time);
      expect(quantized).toBe(time);
    });
  });

  describe('events', () => {
    it('should emit start event', () => {
      const callback = vi.fn();
      transport.on('start', callback);

      transport.start();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should emit stop event', () => {
      const callback = vi.fn();
      transport.on('stop', callback);

      transport.start();
      transport.stop();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should emit pause event', () => {
      const callback = vi.fn();
      transport.on('pause', callback);

      transport.start();
      transport.pause();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('beat duration', () => {
    it('should calculate beat duration correctly', () => {
      transport.setBPM(120);
      expect(transport.getBeatDuration()).toBe(0.5);

      transport.setBPM(60);
      expect(transport.getBeatDuration()).toBe(1);
    });
  });

  describe('measure duration', () => {
    it('should calculate measure duration correctly', () => {
      transport.setBPM(120);
      transport.setTimeSignature(4, 4);
      expect(transport.getMeasureDuration()).toBe(2);
    });
  });
});
