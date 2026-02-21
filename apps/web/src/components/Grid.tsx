import React from 'react';
import { PadButton } from './PadButton';
import type { PadState } from '@looppad/core';

export interface GridProps {
  /** Array of pad states */
  pads: PadState[];
  /** Callback when a pad is triggered */
  onPadTrigger: (padId: number) => void;
  /** Callback when a pad is released */
  onPadRelease?: (padId: number) => void;
}

/**
 * Grid - 4x4 grid of pad buttons
 */
export const Grid: React.FC<GridProps> = ({
  pads,
  onPadTrigger,
  onPadRelease,
}) => {
  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0',
        padding: '20px',
        backgroundColor: '#0a0a0f',
        borderRadius: '12px',
        width: 'fit-content',
      }}
    >
      {pads.map((pad) => (
        <PadButton
          key={pad.id}
          id={pad.id}
          isPlaying={pad.isPlaying}
          color={pad.color}
          onTrigger={onPadTrigger}
          onRelease={onPadRelease}
        />
      ))}
    </div>
  );
};
