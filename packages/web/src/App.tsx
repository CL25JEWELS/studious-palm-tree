/**
 * Main App Component
 * Root component for EchoForge web app
 */

import React, { useEffect, useState } from 'react';
import { AudioEngine, PadController, Transport } from '@echoforge/core';
import type { PadState, TransportState } from '@echoforge/shared-types';
import { PadGrid, TransportBar, PadControls } from '@echoforge/ui';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [padController] = useState(() => new PadController());
  const [transport] = useState(() => new Transport());
  const [pads, setPads] = useState<PadState[]>([]);
  const [transportState, setTransportState] = useState<TransportState>('stopped');
  const [bpm, setBpm] = useState(120);
  const [selectedPadId, setSelectedPadId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize audio engine
    const init = async () => {
      try {
        await audioEngine.initialize();
        console.log('Audio engine initialized');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };

    init();

    // Create initial pads
    const initialPads: PadState[] = [];
    for (let i = 0; i < 8; i++) {
      const pad = padController.createPad({
        instrumentId: 'default',
        color: `hsl(${i * 45}, 70%, 50%)`,
      });
      audioEngine.registerPad(pad);
      initialPads.push(pad);
    }

    // Subscribe to pad controller updates
    const unsubscribe = padController.subscribe((updatedPads) => {
      setPads([...updatedPads]);
    });

    // Subscribe to transport state changes
    transport.on('start', () => setTransportState('playing'));
    transport.on('stop', () => setTransportState('stopped'));
    transport.on('pause', () => setTransportState('paused'));

    // Cleanup
    return () => {
      unsubscribe();
      audioEngine.dispose();
    };
  }, [audioEngine, padController, transport]);

  const handleTriggerPad = (padId: string) => {
    if (!isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }
    
    try {
      audioEngine.triggerPad(padId);
      setSelectedPadId(padId);
    } catch (error) {
      console.error('Failed to trigger pad:', error);
    }
  };

  const handleReleasePad = (padId: string) => {
    try {
      audioEngine.stopPad(padId);
    } catch (error) {
      console.error('Failed to release pad:', error);
    }
  };

  const handleUpdatePad = (padId: string, updates: Partial<PadState>) => {
    try {
      padController.updatePad(padId, updates);
      audioEngine.updatePadState(padId, updates);
    } catch (error) {
      console.error('Failed to update pad:', error);
    }
  };

  const handlePlay = () => {
    transport.start();
  };

  const handleStop = () => {
    transport.stop();
  };

  const handlePause = () => {
    transport.pause();
  };

  const handleBPMChange = (newBpm: number) => {
    setBpm(newBpm);
    transport.setBPM(newBpm);
  };

  const selectedPad = selectedPadId ? padController.getPad(selectedPadId) : null;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    padding: '2rem',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: '#9e9e9e',
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  };

  const statusStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    color: isInitialized ? '#4caf50' : '#ff9800',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>EchoForge</h1>
        <p style={subtitleStyle}>Real-time Loop-Pad Music Creation</p>
      </header>

      <div style={statusStyle}>
        {isInitialized ? '✓ Audio Engine Ready' : '⚠ Initializing Audio Engine...'}
      </div>

      <main style={mainContentStyle}>
        <TransportBar
          state={transportState}
          bpm={bpm}
          onPlay={handlePlay}
          onStop={handleStop}
          onPause={handlePause}
          onBPMChange={handleBPMChange}
        />

        <PadGrid
          pads={pads}
          columns={4}
          onTriggerPad={handleTriggerPad}
          onReleasePad={handleReleasePad}
        />

        {selectedPad && (
          <PadControls pad={selectedPad} onUpdate={handleUpdatePad} />
        )}

        <div style={{ textAlign: 'center', color: '#9e9e9e', fontSize: '0.875rem', marginTop: '2rem' }}>
          <p>Click any pad to trigger a sound (demo mode - no samples loaded)</p>
          <p>Use the transport controls to start/stop playback</p>
          <p>Adjust pad parameters using the sliders above</p>
        </div>
      </main>
    </div>
  );
}

export default App;
