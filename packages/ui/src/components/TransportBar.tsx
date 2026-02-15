/**
 * TransportBar Component
 * Playback controls and tempo display
 */

import React from 'react';
import type { TransportState } from '@echoforge/shared-types';

export interface TransportBarProps {
  state: TransportState;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onBPMChange: (bpm: number) => void;
  className?: string;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  state,
  bpm,
  onPlay,
  onStop,
  onPause,
  onBPMChange,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    backgroundColor: '#2196f3',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#1976d2',
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    backgroundColor: '#121212',
    border: '1px solid #424242',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.875rem',
    width: '80px',
    textAlign: 'center',
  };

  const handleBPMInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 60 && value <= 300) {
      onBPMChange(value);
    }
  };

  return (
    <div className={className} style={containerStyle} role="toolbar" aria-label="Transport controls">
      <button
        style={state === 'playing' ? activeButtonStyle : buttonStyle}
        onClick={onPlay}
        disabled={state === 'playing'}
        aria-label="Play"
      >
        ▶ Play
      </button>
      <button
        style={state === 'paused' ? activeButtonStyle : buttonStyle}
        onClick={onPause}
        disabled={state !== 'playing'}
        aria-label="Pause"
      >
        ⏸ Pause
      </button>
      <button
        style={buttonStyle}
        onClick={onStop}
        disabled={state === 'stopped'}
        aria-label="Stop"
      >
        ⏹ Stop
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label htmlFor="bpm-input" style={{ color: '#ffffff', fontSize: '0.875rem' }}>
          BPM:
        </label>
        <input
          id="bpm-input"
          type="number"
          min="60"
          max="300"
          value={bpm}
          onChange={handleBPMInput}
          style={inputStyle}
          aria-label="Beats per minute"
        />
      </div>
    </div>
  );
};
