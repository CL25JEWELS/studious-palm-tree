/**
 * PadButton Component
 * Individual pad in the grid
 */

import React from 'react';
import type { PadState } from '@echoforge/shared-types';

export interface PadButtonProps {
  pad: PadState;
  onTrigger: (padId: string) => void;
  onRelease?: (padId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const PadButton: React.FC<PadButtonProps> = ({
  pad,
  onTrigger,
  onRelease,
  disabled = false,
  className = '',
}) => {
  const handleMouseDown = () => {
    if (!disabled && pad.isActive && !pad.isMuted) {
      onTrigger(pad.id);
    }
  };

  const handleMouseUp = () => {
    if (pad.playbackMode === 'hold' && onRelease) {
      onRelease(pad.id);
    }
  };

  const getBackgroundColor = () => {
    if (pad.isMuted) return '#424242';
    if (!pad.isActive) return '#212121';
    return pad.color || '#2196f3';
  };

  const style: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: getBackgroundColor(),
    border: pad.isSolo ? '2px solid #e91e63' : '1px solid #424242',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#ffffff',
    userSelect: 'none',
    transition: 'all 150ms ease',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button
      className={className}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      aria-label={`Pad ${pad.id}`}
      aria-pressed={pad.isActive}
    >
      {pad.id.split('_')[1]?.slice(0, 4) || pad.id.slice(0, 4)}
    </button>
  );
};
