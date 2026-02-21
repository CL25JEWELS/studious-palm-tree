import React, { useState, useEffect } from 'react';
import {
  AudioEngine,
  PadController,
  Transport,
  ProjectManager,
} from '@looppad/core';
import { Grid, TransportBar, RemixPanel } from './components';

// Constants
const PAD_AUTO_STOP_DELAY_MS = 500;

export const App: React.FC = () => {
  // Initialize core systems
  const [engine] = useState(() => new AudioEngine({ logger: console }));
  const [padController] = useState(() => new PadController());
  const [transport] = useState(() => new Transport({ bpm: 120 }));
  const [projectManager] = useState(() => new ProjectManager());

  // UI state
  const [pads, setPads] = useState(padController.getAllPads());
  const [transportState, setTransportState] = useState(transport.getState());
  const [currentProject, setCurrentProject] = useState(
    projectManager.getCurrentProject()
  );

  // Subscribe to transport events
  useEffect(() => {
    const listener = () => {
      setTransportState(transport.getState());
    };

    transport.addListener(listener);

    return () => {
      transport.removeListener(listener);
    };
  }, [transport]);

  // Update pads state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPads(padController.getAllPads());
    }, 100);

    return () => clearInterval(interval);
  }, [padController]);

  // Handlers
  const handlePadTrigger = (padId: number) => {
    console.log('Pad triggered:', padId);
    padController.triggerPad(padId);
    
    // Auto-stop after delay for demo
    setTimeout(() => {
      padController.stopPad(padId);
    }, PAD_AUTO_STOP_DELAY_MS);
  };

  const handlePadRelease = (padId: number) => {
    console.log('Pad released:', padId);
    padController.stopPad(padId);
  };

  const handlePlay = () => {
    console.log('Transport: Play');
    transport.start();
    engine.start();
  };

  const handleStop = () => {
    console.log('Transport: Stop');
    transport.stop();
    engine.stop();
  };

  const handleBPMChange = (bpm: number) => {
    console.log('BPM changed to:', bpm);
    transport.setBPM(bpm);
    setTransportState(transport.getState());
  };

  const handleNewProject = () => {
    const project = projectManager.createProject('New Project');
    setCurrentProject(project);
    console.log('Created new project:', project.metadata.name);
  };

  const handleSaveProject = async () => {
    try {
      await projectManager.saveProject();
      console.log('Project saved successfully');
      alert('Project saved!');
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project');
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await projectManager.loadProject(projectId);
      setCurrentProject(project);
      console.log('Project loaded:', project.metadata.name);
    } catch (err) {
      console.error('Failed to load project:', err);
      alert('Failed to load project');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px',
      }}
    >
      <header style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '48px',
            margin: 0,
            background: 'linear-gradient(90deg, #00d9ff, #ff00ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          LoopPad
        </h1>
        <p style={{ color: '#888', margin: '10px 0 0 0' }}>
          Loop-based music creation tool
        </p>
      </header>

      <main>
        <TransportBar
          state={transportState}
          onPlay={handlePlay}
          onStop={handleStop}
          onBPMChange={handleBPMChange}
        />

        <Grid
          pads={pads}
          onPadTrigger={handlePadTrigger}
          onPadRelease={handlePadRelease}
        />

        <RemixPanel
          project={currentProject?.metadata}
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProject}
        />
      </main>
    </div>
  );
};

export default App;
