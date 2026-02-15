import { describe, it, expect, beforeEach } from 'vitest';
import { PadController } from '../src/pad-controller';

describe('PadController', () => {
  let controller: PadController;

  beforeEach(() => {
    controller = new PadController();
  });

  describe('createPad', () => {
    it('should create a pad with default values', () => {
      const pad = controller.createPad({});

      expect(pad.id).toBeDefined();
      expect(pad.volume).toBe(0.8);
      expect(pad.pitch).toBe(0);
      expect(pad.pan).toBe(0);
      expect(pad.isActive).toBe(true);
      expect(pad.isMuted).toBe(false);
      expect(pad.playbackMode).toBe('oneShot');
    });

    it('should create a pad with custom values', () => {
      const pad = controller.createPad({
        volume: 0.5,
        pitch: 3,
        pan: -0.5,
        playbackMode: 'loop',
      });

      expect(pad.volume).toBe(0.5);
      expect(pad.pitch).toBe(3);
      expect(pad.pan).toBe(-0.5);
      expect(pad.playbackMode).toBe('loop');
    });

    it('should generate unique IDs for each pad', () => {
      const pad1 = controller.createPad({});
      const pad2 = controller.createPad({});

      expect(pad1.id).not.toBe(pad2.id);
    });
  });

  describe('getPad', () => {
    it('should return a pad by ID', () => {
      const created = controller.createPad({ volume: 0.7 });
      const retrieved = controller.getPad(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent pad', () => {
      const pad = controller.getPad('nonexistent');

      expect(pad).toBeNull();
    });
  });

  describe('updatePad', () => {
    it('should update pad properties', () => {
      const pad = controller.createPad({ volume: 0.8 });

      controller.updatePad(pad.id, { volume: 0.5, pitch: 2 });

      const updated = controller.getPad(pad.id);
      expect(updated?.volume).toBe(0.5);
      expect(updated?.pitch).toBe(2);
    });

    it('should throw error for non-existent pad', () => {
      expect(() => {
        controller.updatePad('nonexistent', { volume: 0.5 });
      }).toThrow('Pad not found');
    });
  });

  describe('deletePad', () => {
    it('should delete a pad', () => {
      const pad = controller.createPad({});

      controller.deletePad(pad.id);

      const retrieved = controller.getPad(pad.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllPads', () => {
    it('should return all pads', () => {
      const pad1 = controller.createPad({});
      const pad2 = controller.createPad({});

      const allPads = controller.getAllPads();

      expect(allPads).toHaveLength(2);
      expect(allPads).toContainEqual(pad1);
      expect(allPads).toContainEqual(pad2);
    });

    it('should return empty array when no pads exist', () => {
      const allPads = controller.getAllPads();

      expect(allPads).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers on pad creation', () => {
      let notified = false;
      let receivedPads: any[] = [];

      controller.subscribe((pads) => {
        notified = true;
        receivedPads = pads;
      });

      const pad = controller.createPad({});

      expect(notified).toBe(true);
      expect(receivedPads).toHaveLength(1);
      expect(receivedPads[0]).toEqual(pad);
    });

    it('should notify subscribers on pad update', () => {
      const pad = controller.createPad({});
      let notificationCount = 0;

      controller.subscribe(() => {
        notificationCount++;
      });

      controller.updatePad(pad.id, { volume: 0.5 });

      expect(notificationCount).toBe(1);
    });

    it('should allow unsubscribing', () => {
      let notificationCount = 0;

      const unsubscribe = controller.subscribe(() => {
        notificationCount++;
      });

      controller.createPad({});
      expect(notificationCount).toBe(1);

      unsubscribe();

      controller.createPad({});
      expect(notificationCount).toBe(1); // Should not increment
    });
  });
});
