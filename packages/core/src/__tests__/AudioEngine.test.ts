import { AudioEngine, AudioEngineConfig } from '../index';

describe('AudioEngine', () => {
  describe('initialization', () => {
    it('should create an instance without config', () => {
      const engine = new AudioEngine();
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(AudioEngine);
    });

    it('should create an instance with empty config', () => {
      const engine = new AudioEngine({});
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(AudioEngine);
    });

    it('should create an instance with full config', () => {
      const mockLogger = { log: jest.fn() };
      const config: AudioEngineConfig = {
        sampleRate: 48000,
        bufferSize: 256,
        logger: mockLogger
      };
      
      const engine = new AudioEngine(config);
      expect(engine).toBeDefined();
      expect(mockLogger.log).toHaveBeenCalledWith('AudioEngine initialized');
    });

    it('should not log when logger is not provided', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      new AudioEngine();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('lifecycle methods', () => {
    it('should start the engine', () => {
      const mockLogger = { log: jest.fn() };
      const engine = new AudioEngine({ logger: mockLogger });
      
      mockLogger.log.mockClear(); // Clear initialization log
      engine.start();
      
      expect(mockLogger.log).toHaveBeenCalledWith('AudioEngine started');
    });

    it('should stop the engine', () => {
      const mockLogger = { log: jest.fn() };
      const engine = new AudioEngine({ logger: mockLogger });
      
      mockLogger.log.mockClear(); // Clear initialization log
      engine.stop();
      
      expect(mockLogger.log).toHaveBeenCalledWith('AudioEngine stopped');
    });

    it('should handle start and stop sequence', () => {
      const mockLogger = { log: jest.fn() };
      const engine = new AudioEngine({ logger: mockLogger });
      
      mockLogger.log.mockClear();
      engine.start();
      engine.stop();
      
      expect(mockLogger.log).toHaveBeenNthCalledWith(1, 'AudioEngine started');
      expect(mockLogger.log).toHaveBeenNthCalledWith(2, 'AudioEngine stopped');
    });

    it('should not throw when calling lifecycle methods without logger', () => {
      const engine = new AudioEngine();
      
      expect(() => engine.start()).not.toThrow();
      expect(() => engine.stop()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple start calls', () => {
      const mockLogger = { log: jest.fn() };
      const engine = new AudioEngine({ logger: mockLogger });
      
      mockLogger.log.mockClear();
      engine.start();
      engine.start();
      
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple stop calls', () => {
      const mockLogger = { log: jest.fn() };
      const engine = new AudioEngine({ logger: mockLogger });
      
      mockLogger.log.mockClear();
      engine.stop();
      engine.stop();
      
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
    });
  });
});
