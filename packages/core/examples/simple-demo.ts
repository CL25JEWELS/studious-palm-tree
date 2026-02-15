/**
 * Simple usage example for LoopPad core engine
 */

import {
  AudioEngine,
  Transport,
  generateId,
  type Sample,
  type Instrument,
} from '@looppad/core';

async function main() {
  console.log('LoopPad Demo - Initializing...');

  // 1. Create and initialize the audio engine
  const engine = new AudioEngine({
    sampleRate: 44100,
    latency: 'interactive',
    maxVoices: 32,
    bufferSize: 128,
  });

  await engine.initialize();
  console.log('✓ Audio engine initialized');

  // 2. Create a sample (in real app, this would reference an actual audio file)
  const kickSample: Sample = {
    id: 'kick-808',
    name: '808 Kick',
    url: '/sounds/808-kick.wav',
    duration: 0.5,
    sampleRate: 44100,
  };

  // 3. Create an instrument
  const kickInstrument: Instrument = {
    id: generateId(),
    name: 'Kick Drum',
    sampleId: kickSample.id,
    volume: 0.8,
    pan: 0,
    pitch: 0,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    reverb: 0.2,
    delay: 0,
    filter: {
      type: 'lowpass',
      frequency: 2000,
      q: 1.0,
    },
  };

  // 4. Register the instrument with the engine
  engine.registerInstrument(kickInstrument);
  console.log('✓ Instrument registered:', kickInstrument.name);

  // 5. Create transport for timing
  const transport = new Transport(engine, 120); // 120 BPM
  console.log('✓ Transport created at 120 BPM');

  // 6. Trigger a sound
  console.log('\n▶ Triggering kick drum...');
  const voiceId = engine.trigger(kickInstrument.id, 1.0);
  console.log('✓ Voice triggered:', voiceId);

  // 7. Schedule multiple triggers
  const currentTime = engine.getCurrentTime();
  console.log('\n▶ Scheduling pattern...');
  
  // Create a simple 4-on-the-floor pattern
  for (let i = 0; i < 4; i++) {
    const triggerTime = currentTime + (i * 0.5); // Every half second
    engine.trigger(kickInstrument.id, 0.8, triggerTime);
    console.log(`✓ Scheduled trigger ${i + 1} at ${triggerTime.toFixed(3)}s`);
  }

  // 8. Clean up after 3 seconds
  setTimeout(() => {
    console.log('\n✓ Stopping all sounds...');
    engine.stopAll();
    
    void engine.dispose().then(() => {
      console.log('✓ Engine disposed');
      console.log('\nDemo complete!');
    });
  }, 3000);
}

// Run the demo
main().catch((error) => {
  console.error('Error running demo:', error);
});
