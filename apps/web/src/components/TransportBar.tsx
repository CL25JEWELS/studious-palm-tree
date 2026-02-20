import React from 'react';

export interface TransportBarProps {
  bpm: number;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  bpm,
  playing,
  onPlay,
  onStop,
  onBpmChange
}) => {
  return (
    <div data-testid="transport-bar">
      <button
        data-testid="play-button"
        onClick={onPlay}
        disabled={playing}
      >
        Play
      </button>
      <button
        data-testid="stop-button"
        onClick={onStop}
        disabled={!playing}
      >
        Stop
      </button>
      <label>
        BPM:
        <input
          type="number"
          data-testid="bpm-input"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          min={40}
          max={240}
        />
      </label>
      <span data-testid="bpm-display">{bpm} BPM</span>
    </div>
  );
};
