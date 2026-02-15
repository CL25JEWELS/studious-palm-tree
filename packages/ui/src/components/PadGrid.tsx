/**
 * PadGrid Component
 * Grid layout for pads
 */

import React from 'react';
import type { PadState } from '@echoforge/shared-types';
import { PadButton } from './PadButton';

export interface PadGridProps {
  pads: PadState[];
  columns?: number;
  onTriggerPad: (padId: string) => void;
  onReleasePad?: (padId: string) => void;
  className?: string;
}

export const PadGrid: React.FC<PadGridProps> = ({
  pads,
  columns = 4,
  onTriggerPad,
  onReleasePad,
  className = '',
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '1rem',
    padding: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  };

  return (
    <div className={className} style={gridStyle} role="group" aria-label="Pad grid">
      {pads.map((pad) => (
        <PadButton
          key={pad.id}
          pad={pad}
          onTrigger={onTriggerPad}
          onRelease={onReleasePad}
        />
      ))}
    </div>
  );
};
