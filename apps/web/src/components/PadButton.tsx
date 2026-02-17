import React from 'react';

export interface PadButtonProps {
  /** Unique pad identifier */
  id: number;
  /** Current playing state */
  isPlaying: boolean;
  /** Pad color */
  color: string;
  /** Callback when pad is triggered */
  onTrigger: (id: number) => void;
  /** Callback when pad is released */
  onRelease?: (id: number) => void;
}

/**
 * PadButton - Individual pad component for triggering samples
 */
export const PadButton: React.FC<PadButtonProps> = ({
  id,
  isPlaying,
  color,
  onTrigger,
  onRelease,
}) => {
  const handleClick = () => {
    onTrigger(id);
  };

  const handleMouseUp = () => {
    onRelease?.(id);
  };

  return (
    <button
      className="pad-button"
      style={{
        backgroundColor: isPlaying ? color : '#1a1a1f',
        borderColor: color,
        borderWidth: '2px',
        borderStyle: 'solid',
        width: '80px',
        height: '80px',
        margin: '4px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        boxShadow: isPlaying ? `0 0 20px ${color}` : 'none',
      }}
      onClick={handleClick}
      onMouseUp={handleMouseUp}
    >
      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
        {id + 1}
      </span>
    </button>
  );
};
