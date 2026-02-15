/**
 * useAudioEngine - React hook for managing AudioEngine lifecycle
 */

import { useEffect, useRef, useState } from 'react';
import { AudioEngine, Transport, generateId } from '@looppad/core';
import type { UUID, Instrument } from '@looppad/core';

export const useAudioEngine = () => {
  const engineRef = useRef<AudioEngine | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [activePads, setActivePads] = useState<Set<number>>(new Set());

  useEffect(() => {
    const initAudio = async () => {
      if (!engineRef.current) {
        engineRef.current = new AudioEngine({
          maxVoices: 32,
          latency: 'interactive',
        });
        await engineRef.current.initialize();
        
        transportRef.current = new Transport(engineRef.current, tempo);
        setInitialized(true);
      }
    };

    // Initialize on user interaction (required by browsers)
    const handleUserInteraction = () => {
      void initAudio();
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      if (engineRef.current) {
        void engineRef.current.dispose();
      }
    };
  }, []); // Empty dependency array - initialize only once

  const triggerPad = (padIndex: number, velocity: number = 1.0) => {
    if (!engineRef.current || !initialized) return;

    // Create a temporary instrument for demo
    const instrumentId = generateId() as UUID;
    const demoInstrument: Instrument = {
      id: instrumentId,
      name: `Pad ${padIndex}`,
      sampleId: generateId() as UUID, // Would reference actual sample
      volume: velocity,
      pan: 0,
      pitch: 0,
      attack: 0.001,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      reverb: 0,
      delay: 0,
      filter: null,
    };

    engineRef.current.registerInstrument(demoInstrument);
    engineRef.current.trigger(instrumentId, velocity);

    // Visual feedback
    setActivePads((prev) => {
      const next = new Set(prev);
      next.add(padIndex);
      setTimeout(() => {
        setActivePads((curr) => {
          const updated = new Set(curr);
          updated.delete(padIndex);
          return updated;
        });
      }, 200);
      return next;
    });
  };

  const handlePlay = () => {
    if (!transportRef.current) return;
    
    if (playing) {
      transportRef.current.pause();
      setPlaying(false);
    } else {
      transportRef.current.start();
      setPlaying(true);
    }
  };

  const handleStop = () => {
    if (!transportRef.current) return;
    transportRef.current.stop();
    setPlaying(false);
  };

  const handleTempoChange = (newTempo: number) => {
    if (!transportRef.current) return;
    transportRef.current.setTempo(newTempo);
    setTempo(newTempo);
  };

  return {
    initialized,
    playing,
    tempo,
    activePads,
    triggerPad,
    handlePlay,
    handleStop,
    handleTempoChange,
  };
};
