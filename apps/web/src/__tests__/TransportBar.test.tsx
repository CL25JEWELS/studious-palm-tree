import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransportBar } from '../components/TransportBar';

describe('TransportBar Component', () => {
  const mockOnPlay = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnBpmChange = jest.fn();

  const defaultProps = {
    bpm: 120,
    playing: false,
    onPlay: mockOnPlay,
    onStop: mockOnStop,
    onBpmChange: mockOnBpmChange
  };

  beforeEach(() => {
    mockOnPlay.mockClear();
    mockOnStop.mockClear();
    mockOnBpmChange.mockClear();
  });

  describe('rendering', () => {
    it('should render transport bar', () => {
      render(<TransportBar {...defaultProps} />);
      expect(screen.getByTestId('transport-bar')).toBeInTheDocument();
    });

    it('should render play button', () => {
      render(<TransportBar {...defaultProps} />);
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
    });

    it('should render stop button', () => {
      render(<TransportBar {...defaultProps} />);
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    });

    it('should render BPM input', () => {
      render(<TransportBar {...defaultProps} />);
      expect(screen.getByTestId('bpm-input')).toBeInTheDocument();
    });

    it('should display current BPM', () => {
      render(<TransportBar {...defaultProps} bpm={140} />);
      expect(screen.getByTestId('bpm-display')).toHaveTextContent('140 BPM');
    });
  });

  describe('play/stop controls', () => {
    it('should call onPlay when play button is clicked', () => {
      render(<TransportBar {...defaultProps} />);
      const playButton = screen.getByTestId('play-button');
      
      fireEvent.click(playButton);
      
      expect(mockOnPlay).toHaveBeenCalledTimes(1);
    });

    it('should call onStop when stop button is clicked', () => {
      render(<TransportBar {...defaultProps} playing={true} />);
      const stopButton = screen.getByTestId('stop-button');
      
      fireEvent.click(stopButton);
      
      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });

    it('should disable play button when playing', () => {
      render(<TransportBar {...defaultProps} playing={true} />);
      const playButton = screen.getByTestId('play-button');
      expect(playButton).toBeDisabled();
    });

    it('should disable stop button when not playing', () => {
      render(<TransportBar {...defaultProps} playing={false} />);
      const stopButton = screen.getByTestId('stop-button');
      expect(stopButton).toBeDisabled();
    });
  });

  describe('BPM control', () => {
    it('should display correct BPM value in input', () => {
      render(<TransportBar {...defaultProps} bpm={150} />);
      const input = screen.getByTestId('bpm-input') as HTMLInputElement;
      expect(input.value).toBe('150');
    });

    it('should call onBpmChange when BPM is changed', () => {
      render(<TransportBar {...defaultProps} />);
      const input = screen.getByTestId('bpm-input');
      
      fireEvent.change(input, { target: { value: '140' } });
      
      expect(mockOnBpmChange).toHaveBeenCalledTimes(1);
      expect(mockOnBpmChange).toHaveBeenCalledWith(140);
    });

    it('should have min and max attributes on BPM input', () => {
      render(<TransportBar {...defaultProps} />);
      const input = screen.getByTestId('bpm-input');
      
      expect(input).toHaveAttribute('min', '40');
      expect(input).toHaveAttribute('max', '240');
    });
  });

  describe('state changes', () => {
    it('should update when playing state changes', () => {
      const { rerender } = render(<TransportBar {...defaultProps} playing={false} />);
      expect(screen.getByTestId('play-button')).not.toBeDisabled();
      
      rerender(<TransportBar {...defaultProps} playing={true} />);
      expect(screen.getByTestId('play-button')).toBeDisabled();
    });

    it('should update when BPM changes', () => {
      const { rerender } = render(<TransportBar {...defaultProps} bpm={120} />);
      expect(screen.getByTestId('bpm-display')).toHaveTextContent('120 BPM');
      
      rerender(<TransportBar {...defaultProps} bpm={180} />);
      expect(screen.getByTestId('bpm-display')).toHaveTextContent('180 BPM');
    });
  });
});
