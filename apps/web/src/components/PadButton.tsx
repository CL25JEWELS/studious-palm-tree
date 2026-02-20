import React from 'react';

export interface PadButtonProps {
  id: number;
  active: boolean;
  onToggle: (id: number) => void;
}

export const PadButton: React.FC<PadButtonProps> = ({ id, active, onToggle }) => {
  return (
    <button
      data-testid={`pad-button-${id}`}
      className={`pad-button ${active ? 'active' : ''}`}
      onClick={() => onToggle(id)}
      aria-pressed={active}
    >
      Pad {id + 1}
    </button>
  );
};
