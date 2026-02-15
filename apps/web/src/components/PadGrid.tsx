/**
 * PadGrid - 8-16 pad grid component
 * Core UI element for triggering sounds
 */

import React, { useCallback } from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from '../styles/design-system';

interface PadProps {
  index: number;
  label: string;
  color: string;
  active: boolean;
  onTrigger: (index: number, velocity: number) => void;
}

const Pad: React.FC<PadProps> = ({ index, label, color, active, onTrigger }) => {
  const handleClick = useCallback(() => {
    onTrigger(index, 1.0);
  }, [index, onTrigger]);

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'relative',
        aspectRatio: '1',
        background: active ? color : colors.surface.default,
        border: `2px solid ${color}`,
        borderRadius: borderRadius.md,
        color: colors.text.primary,
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: transitions.fast,
        boxShadow: active ? `0 0 20px ${color}` : shadows.sm,
        transform: active ? 'scale(0.95)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.boxShadow = `0 0 20px ${color}`;
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = colors.surface.default;
          e.currentTarget.style.boxShadow = shadows.sm;
        }
      }}
    >
      <div style={{ fontSize: '12px', opacity: 0.7 }}>{index + 1}</div>
      <div>{label}</div>
    </button>
  );
};

interface PadGridProps {
  padCount?: 8 | 16;
  onPadTrigger: (index: number, velocity: number) => void;
  activePads?: Set<number>;
}

export const PadGrid: React.FC<PadGridProps> = ({ 
  padCount = 16, 
  onPadTrigger,
  activePads = new Set(),
}) => {
  const columns = padCount === 8 ? 4 : 4;
  const rows = padCount === 8 ? 2 : 4;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: spacing.md,
        padding: spacing.lg,
        background: colors.bg.secondary,
        borderRadius: borderRadius.lg,
        height: '100%',
        maxHeight: '600px',
      }}
    >
      {Array.from({ length: padCount }).map((_, index) => (
        <Pad
          key={index}
          index={index}
          label={`PAD ${index + 1}`}
          color={colors.pads[index % colors.pads.length]}
          active={activePads.has(index)}
          onTrigger={onPadTrigger}
        />
      ))}
    </div>
  );
};
