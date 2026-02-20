import { Transport, TransportState } from '../index';

describe('Transport', () => {
  let transport: Transport;

  beforeEach(() => {
    transport = new Transport();
  });

  describe('initialization', () => {
    it('should initialize with default BPM of 120', () => {
      expect(transport.getBPM()).toBe(120);
    });

    it('should initialize in stopped state', () => {
      expect(transport.isPlaying()).toBe(false);
    });

    it('should initialize at position 0', () => {
      expect(transport.getPosition()).toBe(0);
    });
  });

  describe('BPM control', () => {
    it('should set BPM', () => {
      transport.setBPM(140);
      expect(transport.getBPM()).toBe(140);
    });

    it('should clamp BPM to minimum 40', () => {
      transport.setBPM(20);
      expect(transport.getBPM()).toBe(40);
    });

    it('should clamp BPM to maximum 240', () => {
      transport.setBPM(300);
      expect(transport.getBPM()).toBe(240);
    });

    it('should accept valid BPM values', () => {
      const validBPMs = [60, 90, 120, 140, 180, 200];
      validBPMs.forEach(bpm => {
        transport.setBPM(bpm);
        expect(transport.getBPM()).toBe(bpm);
      });
    });
  });

  describe('playback control', () => {
    it('should start playback with play()', () => {
      transport.play();
      expect(transport.isPlaying()).toBe(true);
    });

    it('should stop playback with stop()', () => {
      transport.play();
      transport.stop();
      expect(transport.isPlaying()).toBe(false);
    });

    it('should reset position on stop()', () => {
      transport.play();
      transport.stop();
      expect(transport.getPosition()).toBe(0);
    });

    it('should pause playback with pause()', () => {
      transport.play();
      transport.pause();
      expect(transport.isPlaying()).toBe(false);
    });

    it('should not reset position on pause()', () => {
      transport.play();
      // Position would normally advance during playback
      // Here we're just testing that pause doesn't reset it
      transport.pause();
      expect(transport.getPosition()).toBe(0); // Still 0 as we haven't advanced time
    });
  });

  describe('state management', () => {
    it('should return immutable state copy', () => {
      const state1 = transport.getState();
      const state2 = transport.getState();
      
      expect(state1).not.toBe(state2); // Different objects
      expect(state1).toEqual(state2); // Same values
    });

    it('should not allow direct state mutation', () => {
      const state = transport.getState() as any;
      state.bpm = 999;
      
      expect(transport.getBPM()).toBe(120); // Unchanged
    });

    it('should reflect current state', () => {
      transport.setBPM(150);
      transport.play();
      
      const state = transport.getState();
      expect(state.bpm).toBe(150);
      expect(state.playing).toBe(true);
      expect(state.position).toBe(0);
    });
  });

  describe('playback sequences', () => {
    it('should handle play -> stop sequence', () => {
      transport.play();
      expect(transport.isPlaying()).toBe(true);
      
      transport.stop();
      expect(transport.isPlaying()).toBe(false);
      expect(transport.getPosition()).toBe(0);
    });

    it('should handle play -> pause -> play sequence', () => {
      transport.play();
      expect(transport.isPlaying()).toBe(true);
      
      transport.pause();
      expect(transport.isPlaying()).toBe(false);
      
      transport.play();
      expect(transport.isPlaying()).toBe(true);
    });

    it('should handle multiple stop calls', () => {
      transport.play();
      transport.stop();
      transport.stop(); // Should not throw
      
      expect(transport.isPlaying()).toBe(false);
    });
  });
});
