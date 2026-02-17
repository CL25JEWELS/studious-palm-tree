import { PadController, PadState } from '../index';

describe('PadController', () => {
  let controller: PadController;

  beforeEach(() => {
    controller = new PadController();
  });

  describe('initialization', () => {
    it('should initialize 16 pads', () => {
      const pads = controller.getAllPads();
      expect(pads).toHaveLength(16);
    });

    it('should initialize all pads as inactive', () => {
      const pads = controller.getAllPads();
      pads.forEach(pad => {
        expect(pad.active).toBe(false);
      });
    });

    it('should initialize all pads with default volume', () => {
      const pads = controller.getAllPads();
      pads.forEach(pad => {
        expect(pad.volume).toBe(0.8);
      });
    });

    it('should initialize pads with sequential ids', () => {
      const pads = controller.getAllPads();
      pads.forEach((pad, index) => {
        expect(pad.id).toBe(index);
      });
    });
  });

  describe('getPad', () => {
    it('should return a pad by id', () => {
      const pad = controller.getPad(0);
      expect(pad).toBeDefined();
      expect(pad?.id).toBe(0);
    });

    it('should return undefined for invalid id', () => {
      expect(controller.getPad(99)).toBeUndefined();
      expect(controller.getPad(-1)).toBeUndefined();
    });
  });

  describe('togglePad', () => {
    it('should toggle pad from inactive to active', () => {
      const result = controller.togglePad(0);
      expect(result).toBe(true);
      expect(controller.getPad(0)?.active).toBe(true);
    });

    it('should toggle pad from active to inactive', () => {
      controller.togglePad(0); // First toggle to active
      const result = controller.togglePad(0); // Toggle back to inactive
      expect(result).toBe(false);
      expect(controller.getPad(0)?.active).toBe(false);
    });

    it('should return false for invalid pad id', () => {
      expect(controller.togglePad(99)).toBe(false);
    });
  });

  describe('setVolume', () => {
    it('should set pad volume', () => {
      const result = controller.setVolume(0, 0.5);
      expect(result).toBe(true);
      expect(controller.getPad(0)?.volume).toBe(0.5);
    });

    it('should clamp volume to minimum 0', () => {
      controller.setVolume(0, -0.5);
      expect(controller.getPad(0)?.volume).toBe(0);
    });

    it('should clamp volume to maximum 1', () => {
      controller.setVolume(0, 1.5);
      expect(controller.getPad(0)?.volume).toBe(1);
    });

    it('should return false for invalid pad id', () => {
      expect(controller.setVolume(99, 0.5)).toBe(false);
    });
  });

  describe('setSample', () => {
    it('should set pad sample', () => {
      const result = controller.setSample(0, 'kick.wav');
      expect(result).toBe(true);
      expect(controller.getPad(0)?.sample).toBe('kick.wav');
    });

    it('should update existing sample', () => {
      controller.setSample(0, 'kick.wav');
      controller.setSample(0, 'snare.wav');
      expect(controller.getPad(0)?.sample).toBe('snare.wav');
    });

    it('should return false for invalid pad id', () => {
      expect(controller.setSample(99, 'sample.wav')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all pads to inactive', () => {
      controller.togglePad(0);
      controller.togglePad(1);
      controller.reset();
      
      const pads = controller.getAllPads();
      pads.forEach(pad => {
        expect(pad.active).toBe(false);
      });
    });

    it('should reset all volumes to default', () => {
      controller.setVolume(0, 0.5);
      controller.setVolume(1, 0.3);
      controller.reset();
      
      const pads = controller.getAllPads();
      pads.forEach(pad => {
        expect(pad.volume).toBe(0.8);
      });
    });

    it('should clear all samples', () => {
      controller.setSample(0, 'kick.wav');
      controller.setSample(1, 'snare.wav');
      controller.reset();
      
      const pads = controller.getAllPads();
      pads.forEach(pad => {
        expect(pad.sample).toBeUndefined();
      });
    });
  });

  describe('state updates', () => {
    it('should maintain independent pad states', () => {
      controller.togglePad(0);
      controller.setVolume(1, 0.5);
      controller.setSample(2, 'sample.wav');

      expect(controller.getPad(0)?.active).toBe(true);
      expect(controller.getPad(0)?.volume).toBe(0.8);
      expect(controller.getPad(0)?.sample).toBeUndefined();

      expect(controller.getPad(1)?.active).toBe(false);
      expect(controller.getPad(1)?.volume).toBe(0.5);

      expect(controller.getPad(2)?.sample).toBe('sample.wav');
    });
  });
});
