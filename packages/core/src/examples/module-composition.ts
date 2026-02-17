/**
 * Example: Basic Module Composition
 * 
 * This example demonstrates how internal modules interact with each other
 * using the defined interfaces and error handling patterns.
 */

import {
  IAudioEngine,
  ISoundLoader,
  ITransport,
  IVoicePool,
  IMixer,
  LoopPadConfig,
  Result,
  isSuccess,
  isFailure,
  LoopPadError,
  isAudioContextError,
  isBufferLoadError,
  isResourceLimitError,
} from '../internal';

/**
 * Example 1: Initialize audio engine with error handling
 */
async function initializeAudioEngine(
  audioEngine: IAudioEngine,
  config: LoopPadConfig
): Promise<Result<void, LoopPadError>> {
  // Initialize must be called from user interaction
  const result = audioEngine.initialize();
  
  if (isFailure(result)) {
    // Handle error with discriminator pattern
    if (isAudioContextError(result.error)) {
      console.error(`Audio context error: ${result.error.reason}`);
      // Handle specific error cases
      switch (result.error.reason) {
        case 'initialization_failed':
          // Retry logic or fallback
          break;
        case 'context_suspended':
          // Resume context
          break;
        case 'context_closed':
          // Cannot recover
          break;
      }
    }
    return result;
  }

  // Start the engine
  return audioEngine.start();
}

/**
 * Example 2: Load and play a sound with full error handling
 */
async function loadAndPlaySound(
  soundLoader: ISoundLoader,
  voicePool: IVoicePool,
  url: string
): Promise<Result<void, LoopPadError>> {
  // Load the sound buffer
  const loadResult = soundLoader.load(url);
  
  if (isFailure(loadResult)) {
    if (isBufferLoadError(loadResult.error)) {
      console.error(`Failed to load ${loadResult.error.url}: ${loadResult.error.message}`);
      if (loadResult.error.statusCode === 404) {
        // Handle missing file
      }
    }
    return loadResult;
  }

  const buffer = loadResult.value;

  // Allocate a voice from the pool
  const voiceResult = voicePool.allocate();
  
  if (isFailure(voiceResult)) {
    if (isResourceLimitError(voiceResult.error)) {
      console.warn(`Voice pool full: ${voiceResult.error.limit} voices in use`);
      // Could implement voice stealing here
    }
    return voiceResult;
  }

  const voice = voiceResult.value;

  // Trigger the voice with the buffer
  const triggerResult = voice.trigger(buffer, {
    volume: 0.8,
    pan: 0.0,
    loop: false,
  });

  if (isFailure(triggerResult)) {
    // Release the voice if trigger fails
    voicePool.release(voice);
    return triggerResult;
  }

  // Set up voice release when playback completes
  // (In real implementation, this would be event-driven)
  setTimeout(() => {
    voicePool.release(voice);
  }, buffer.duration * 1000);

  return { ok: true, value: undefined };
}

/**
 * Example 3: Transport control with scheduled events
 */
function setupTransportWithScheduling(
  transport: ITransport,
  voicePool: IVoicePool,
  soundLoader: ISoundLoader,
  pattern: Array<{ time: number; url: string }>
): Result<void, LoopPadError> {
  // Set tempo
  const tempoResult = transport.setTempo(120);
  if (isFailure(tempoResult)) {
    return tempoResult;
  }

  // Schedule sounds to play at specific times
  for (const event of pattern) {
    const scheduleResult = transport.schedule(event.time, () => {
      // This callback is executed at the scheduled time
      const bufferResult = soundLoader.getBuffer(event.url);
      if (isSuccess(bufferResult)) {
        const voiceResult = voicePool.allocate();
        if (isSuccess(voiceResult)) {
          voiceResult.value.trigger(bufferResult.value);
        }
      }
    });

    if (isFailure(scheduleResult)) {
      console.error(`Failed to schedule event at ${event.time}`);
      // Continue scheduling other events
    }
  }

  // Start playback
  return transport.start();
}

/**
 * Example 4: Mixer setup with multiple tracks
 */
function setupMixer(
  mixer: IMixer,
  soundLoader: ISoundLoader
): Result<Map<string, string>, LoopPadError> {
  const trackIds = new Map<string, string>();

  // Create tracks for different sound categories
  const trackNames = ['drums', 'bass', 'melody', 'effects'];

  for (const trackName of trackNames) {
    const trackResult = mixer.createTrack(trackName);
    
    if (isFailure(trackResult)) {
      if (isResourceLimitError(trackResult.error)) {
        console.warn(`Cannot create track ${trackName}: track limit reached`);
        continue;
      }
      return trackResult;
    }

    const track = trackResult.value;
    trackIds.set(trackName, track.id);

    // Configure track
    track.setVolume(0.8);
    track.setPan(0.0);

    // Different configuration per track type
    switch (trackName) {
      case 'drums':
        track.setVolume(0.9);
        break;
      case 'bass':
        track.setVolume(0.85);
        track.setPan(-0.2);
        break;
      case 'melody':
        track.setVolume(0.7);
        track.setPan(0.2);
        break;
      case 'effects':
        track.setVolume(0.6);
        break;
    }
  }

  // Set master volume
  mixer.setMasterVolume(0.8);

  return { ok: true, value: trackIds };
}

/**
 * Example 5: Complete system initialization
 */
class LoopPadSystem {
  constructor(
    private audioEngine: IAudioEngine,
    private soundLoader: ISoundLoader,
    private transport: ITransport,
    private voicePool: IVoicePool,
    private mixer: IMixer
  ) {}

  async initialize(config: LoopPadConfig): Promise<Result<void, LoopPadError>> {
    // Initialize audio engine (must be called from user interaction)
    const engineResult = await initializeAudioEngine(this.audioEngine, config);
    if (isFailure(engineResult)) {
      return engineResult;
    }

    // Set up transport
    const tempoResult = this.transport.setTempo(config.transport?.tempo ?? 120);
    if (isFailure(tempoResult)) {
      return tempoResult;
    }

    // Set up mixer
    const mixerResult = setupMixer(this.mixer, this.soundLoader);
    if (isFailure(mixerResult)) {
      return mixerResult;
    }

    return { ok: true, value: undefined };
  }

  async loadAndPlay(url: string): Promise<Result<void, LoopPadError>> {
    return loadAndPlaySound(this.soundLoader, this.voicePool, url);
  }

  schedulePattern(pattern: Array<{ time: number; url: string }>): Result<void, LoopPadError> {
    return setupTransportWithScheduling(
      this.transport,
      this.voicePool,
      this.soundLoader,
      pattern
    );
  }

  startPlayback(): Result<void, LoopPadError> {
    return this.transport.start();
  }

  stopPlayback(): Result<void, LoopPadError> {
    return this.transport.stop();
  }

  shutdown(): void {
    this.transport.stop();
    this.voicePool.stopAll();
    this.audioEngine.stop();
  }
}

/**
 * Example 6: Usage in application code
 */
async function applicationExample(
  system: LoopPadSystem,
  config: LoopPadConfig
): Promise<void> {
  // Initialize the system (from user interaction, e.g., button click)
  const initResult = await system.initialize(config);
  
  if (isFailure(initResult)) {
    console.error('Failed to initialize:', initResult.error.message);
    return;
  }

  // Load and play a sound
  const playResult = await system.loadAndPlay('/sounds/kick.wav');
  
  if (isFailure(playResult)) {
    console.error('Failed to play sound:', playResult.error.message);
    return;
  }

  // Schedule a pattern
  const pattern = [
    { time: 0.0, url: '/sounds/kick.wav' },
    { time: 0.5, url: '/sounds/snare.wav' },
    { time: 1.0, url: '/sounds/kick.wav' },
    { time: 1.5, url: '/sounds/hihat.wav' },
  ];

  const scheduleResult = system.schedulePattern(pattern);
  
  if (isFailure(scheduleResult)) {
    console.error('Failed to schedule pattern:', scheduleResult.error.message);
    return;
  }

  // Start playback
  const startResult = system.startPlayback();
  
  if (isSuccess(startResult)) {
    console.log('Playback started successfully');
  }

  // Later: stop and cleanup
  setTimeout(() => {
    system.shutdown();
  }, 5000);
}

export {
  initializeAudioEngine,
  loadAndPlaySound,
  setupTransportWithScheduling,
  setupMixer,
  LoopPadSystem,
  applicationExample,
};
