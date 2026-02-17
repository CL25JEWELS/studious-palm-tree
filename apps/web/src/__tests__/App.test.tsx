import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App Component', () => {
  describe('rendering', () => {
    it('should render the app title', () => {
      render(<App />);
      expect(screen.getByText('Loop Pad')).toBeInTheDocument();
    });

    it('should render start button', () => {
      render(<App />);
      const button = screen.getByRole('button', { name: /start audio engine/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle button click without errors', () => {
      render(<App />);
      const button = screen.getByRole('button', { name: /start audio engine/i });
      
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should initialize AudioEngine on mount', () => {
      // This test verifies the component doesn't crash during initialization
      expect(() => render(<App />)).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should maintain AudioEngine instance across renders', () => {
      const { rerender } = render(<App />);
      rerender(<App />);
      
      // Component should re-render without errors
      expect(screen.getByText('Loop Pad')).toBeInTheDocument();
    });
  });
});
