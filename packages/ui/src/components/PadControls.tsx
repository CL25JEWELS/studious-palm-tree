/**
 * PadControls Component
 * Per-pad parameter controls
 */

import React from 'react';
import type { PadState } from '@echoforge/shared-types';

export interface PadControlsProps {
  pad: PadState;
  onUpdate: (padId: string, updates: Partial<PadState>) => void;
  className?: string;
}

export const PadControls: React.FC<PadControlsProps> = ({ pad, onUpdate, className = '' }) => {
  const containerStyle: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const controlStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 500,
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#424242',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div className={className} style={containerStyle}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1rem' }}>
        Pad Controls: {pad.id.split('_')[1]?.slice(0, 4) || pad.id.slice(0, 4)}
      </h3>

      <div style={controlStyle}>
        <label style={labelStyle} htmlFor={`volume-${pad.id}`}>
          Volume: {Math.round(pad.volume * 100)}%
        </label>
        <input
          id={`volume-${pad.id}`}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={pad.volume}
          onChange={(e) => onUpdate(pad.id, { volume: parseFloat(e.target.value) })}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle} htmlFor={`pitch-${pad.id}`}>
          Pitch: {pad.pitch > 0 ? '+' : ''}
          {pad.pitch} st
        </label>
        <input
          id={`pitch-${pad.id}`}
          type="range"
          min="-12"
          max="12"
          step="1"
          value={pad.pitch}
          onChange={(e) => onUpdate(pad.id, { pitch: parseInt(e.target.value, 10) })}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle} htmlFor={`pan-${pad.id}`}>
          Pan: {pad.pan === 0 ? 'Center' : pad.pan < 0 ? `L ${Math.abs(pad.pan * 100).toFixed(0)}%` : `R ${(pad.pan * 100).toFixed(0)}%`}
        </label>
        <input
          id={`pan-${pad.id}`}
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={pad.pan}
          onChange={(e) => onUpdate(pad.id, { pan: parseFloat(e.target.value) })}
          style={sliderStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onUpdate(pad.id, { isMuted: !pad.isMuted })}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: pad.isMuted ? '#f44336' : '#424242',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {pad.isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={() => onUpdate(pad.id, { isSolo: !pad.isSolo })}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: pad.isSolo ? '#e91e63' : '#424242',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {pad.isSolo ? 'Unsolo' : 'Solo'}
        </button>
      </div>
    </div>
  );
};
