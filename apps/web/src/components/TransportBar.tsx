import React from 'react';
import type { TransportState } from '@looppad/core';

export interface TransportBarProps {
  /** Current transport state */
  state: TransportState;
  /** Callback to start playback */
  onPlay: () => void;
  /** Callback to stop playback */
  onStop: () => void;
  /** Callback to change BPM */
  onBPMChange: (bpm: number) => void;
}

/**
 * TransportBar - Playback controls and tempo settings
 */
export const TransportBar: React.FC<TransportBarProps> = ({
  state,
  onPlay,
  onStop,
  onBPMChange,
}) => {
  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onBPMChange(value);
    }
  };

  return (
    <div
      className="transport-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#1a1a1f',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onPlay}
          disabled={state.isPlaying}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: state.isPlaying ? '#333' : '#00d9ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: state.isPlaying ? 'not-allowed' : 'pointer',
          }}
        >
          ▶ Play
        </button>
        <button
          onClick={onStop}
          disabled={!state.isPlaying}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: !state.isPlaying ? '#333' : '#ff00ea',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: !state.isPlaying ? 'not-allowed' : 'pointer',
          }}
        >
          ■ Stop
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#fff', fontSize: '14px' }}>BPM:</label>
        <input
          type="number"
          value={state.bpm}
          onChange={handleBPMChange}
          min={20}
          max={300}
          style={{
            width: '60px',
            padding: '8px',
            fontSize: '14px',
            backgroundColor: '#0a0a0f',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '4px',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginLeft: 'auto',
        }}
      >
        <span style={{ color: '#888', fontSize: '14px' }}>
          Bar: {state.currentBar + 1} | Beat: {state.currentBeat + 1}
        </span>
      </div>
    </div>
  );
};
