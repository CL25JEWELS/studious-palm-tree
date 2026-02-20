import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PadButton } from '../components/PadButton';

describe('PadButton Component', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe('rendering', () => {
    it('should render pad button with id', () => {
      render(<PadButton id={0} active={false} onToggle={mockOnToggle} />);
      expect(screen.getByTestId('pad-button-0')).toBeInTheDocument();
    });

    it('should display pad number', () => {
      render(<PadButton id={5} active={false} onToggle={mockOnToggle} />);
      expect(screen.getByText('Pad 6')).toBeInTheDocument();
    });

    it('should apply active class when active', () => {
      render(<PadButton id={0} active={true} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-0');
      expect(button).toHaveClass('active');
    });

    it('should not apply active class when inactive', () => {
      render(<PadButton id={0} active={false} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-0');
      expect(button).not.toHaveClass('active');
    });
  });

  describe('interactions', () => {
    it('should call onToggle when clicked', () => {
      render(<PadButton id={3} active={false} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-3');
      
      fireEvent.click(button);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith(3);
    });

    it('should call onToggle with correct id on multiple clicks', () => {
      render(<PadButton id={7} active={false} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-7');
      
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(2);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, 7);
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, 7);
    });
  });

  describe('accessibility', () => {
    it('should have aria-pressed attribute', () => {
      render(<PadButton id={0} active={false} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-0');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should update aria-pressed when active', () => {
      render(<PadButton id={0} active={true} onToggle={mockOnToggle} />);
      const button = screen.getByTestId('pad-button-0');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('state changes', () => {
    it('should update when active prop changes', () => {
      const { rerender } = render(<PadButton id={0} active={false} onToggle={mockOnToggle} />);
      let button = screen.getByTestId('pad-button-0');
      expect(button).not.toHaveClass('active');
      
      rerender(<PadButton id={0} active={true} onToggle={mockOnToggle} />);
      button = screen.getByTestId('pad-button-0');
      expect(button).toHaveClass('active');
    });
  });
});
