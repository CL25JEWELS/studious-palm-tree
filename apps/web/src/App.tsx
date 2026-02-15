/**
 * Main App Component
 */

import React, { useState } from 'react';
import { PadGrid } from './components/PadGrid';
import { Transport } from './components/Transport';
import { SoundPackSelector } from './components/SoundPackSelector';
import { useAudioEngine } from './hooks/useAudioEngine';
import { colors, spacing, typography } from './styles/design-system';
import type { SoundPack } from '@looppad/core';

// Demo sound packs
const demoSoundPacks: SoundPack[] = [
  {
    id: 'pack-1',
    name: '808 Kit',
    description: 'Classic 808 drum sounds',
    author: 'LoopPad',
    version: '1.0.0',
    tags: ['drums', '808', 'classic'],
    samples: [],
    instruments: [],
    storageType: 'local',
    lastModified: new Date(),
    size: 0,
  },
  {
    id: 'pack-2',
    name: 'Techno Essentials',
    description: 'Hard-hitting techno drums',
    author: 'LoopPad',
    version: '1.0.0',
    tags: ['drums', 'techno', 'electronic'],
    samples: [],
    instruments: [],
    storageType: 'local',
    lastModified: new Date(),
    size: 0,
  },
];

export const App: React.FC = () => {
  const {
    initialized,
    playing,
    tempo,
    activePads,
    triggerPad,
    handlePlay,
    handleStop,
    handleTempoChange,
  } = useAudioEngine();

  const [recording, setRecording] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>('pack-1');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: spacing.lg,
        gap: spacing.lg,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            background: `linear-gradient(135deg, ${colors.accent.cyan} 0%, ${colors.accent.magenta} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          LoopPad
        </h1>
        {!initialized && (
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
            }}
          >
            Click anywhere to initialize audio...
          </div>
        )}
      </header>

      {/* Main content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: spacing.lg,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left column - Pads and Transport */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
          }}
        >
          <PadGrid
            padCount={16}
            onPadTrigger={triggerPad}
            activePads={activePads}
          />
          
          <Transport
            playing={playing}
            recording={recording}
            tempo={tempo}
            onPlay={handlePlay}
            onStop={handleStop}
            onRecord={() => setRecording(!recording)}
            onTempoChange={handleTempoChange}
          />
        </div>

        {/* Right column - Sound Pack Selector */}
        <div>
          <SoundPackSelector
            packs={demoSoundPacks}
            selectedPackId={selectedPackId}
            onSelectPack={setSelectedPackId}
          />
        </div>
      </div>
    </div>
  );
};
