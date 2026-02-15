/**
 * Tests for VoicePool
 */

import { VoicePool } from '../engine/VoicePool';

describe('VoicePool', () => {
  let pool: VoicePool;

  beforeEach(() => {
    pool = new VoicePool({ maxVoices: 8 });
  });

  describe('initialization', () => {
    it('should initialize with correct number of voices', () => {
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.hasAvailable()).toBe(true);
    });
  });

  describe('allocate', () => {
    it('should allocate a voice', () => {
      const voiceId = pool.allocate();
      expect(voiceId).not.toBeNull();
      expect(pool.getActiveCount()).toBe(1);
    });

    it('should allocate multiple voices', () => {
      const voice1 = pool.allocate();
      const voice2 = pool.allocate();
      const voice3 = pool.allocate();
      
      expect(voice1).not.toBeNull();
      expect(voice2).not.toBeNull();
      expect(voice3).not.toBeNull();
      expect(pool.getActiveCount()).toBe(3);
    });

    it('should steal voice when limit reached', () => {
      // Allocate all voices
      for (let i = 0; i < 8; i++) {
        pool.allocate();
      }
      expect(pool.getActiveCount()).toBe(8);
      expect(pool.hasAvailable()).toBe(false);

      // Allocate one more - should steal
      const voiceId = pool.allocate();
      expect(voiceId).not.toBeNull();
      expect(pool.getActiveCount()).toBe(8);
    });
  });

  describe('release', () => {
    it('should release a voice', () => {
      const voiceId = pool.allocate();
      expect(pool.getActiveCount()).toBe(1);
      
      if (voiceId) {
        pool.release(voiceId);
      }
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.hasAvailable()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset pool state', () => {
      pool.allocate();
      pool.allocate();
      pool.allocate();
      expect(pool.getActiveCount()).toBe(3);

      pool.reset();
      expect(pool.getActiveCount()).toBe(0);
      expect(pool.hasAvailable()).toBe(true);
    });
  });
});
