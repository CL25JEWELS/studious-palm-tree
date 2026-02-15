/**
 * Transport - Playback control UI
 */

import React from 'react';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/design-system';

interface TransportProps {
  playing: boolean;
  recording: boolean;
  tempo: number;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onTempoChange: (tempo: number) => void;
}

export const Transport: React.FC<TransportProps> = ({
  playing,
  recording,
  tempo,
  onPlay,
  onStop,
  onRecord,
  onTempoChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.lg,
        padding: spacing.lg,
        background: colors.bg.secondary,
        borderRadius: borderRadius.lg,
      }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={onPlay}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: borderRadius.full,
          background: playing ? colors.accent.yellow : colors.accent.cyan,
          border: 'none',
          color: colors.bg.primary,
          fontSize: '24px',
          fontWeight: typography.fontWeight.bold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: playing ? shadows.glow.yellow : shadows.glow.cyan,
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: borderRadius.md,
          background: colors.surface.default,
          border: `2px solid ${colors.accent.red}`,
          color: colors.accent.red,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ⏹
      </button>

      {/* Record Button */}
      <button
        onClick={onRecord}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: borderRadius.full,
          background: recording ? colors.accent.red : colors.surface.default,
          border: `2px solid ${colors.accent.red}`,
          color: recording ? colors.bg.primary : colors.accent.red,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: recording ? '0 0 20px rgba(255, 0, 85, 0.6)' : 'none',
        }}
      >
        ⏺
      </button>

      {/* Tempo Control */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
        }}
      >
        <label
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Tempo
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => onTempoChange(Number(e.target.value))}
            style={{
              width: '120px',
              accentColor: colors.accent.cyan,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.mono,
              color: colors.accent.cyan,
              minWidth: '60px',
            }}
          >
            {tempo} BPM
          </span>
        </div>
      </div>
    </div>
  );
};
