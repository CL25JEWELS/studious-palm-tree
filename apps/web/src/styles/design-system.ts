/**
 * Design System - Core visual tokens for LoopPad
 * EDM-inspired dark theme with vibrant accent colors
 */

export const colors = {
  // Background layers
  bg: {
    primary: '#0a0a0f',      // Deep black-blue
    secondary: '#141420',    // Elevated surfaces
    tertiary: '#1e1e2e',     // Cards and panels
  },
  
  // UI elements
  surface: {
    default: '#252535',
    hover: '#2f2f45',
    active: '#3a3a55',
    disabled: '#1a1a25',
  },
  
  // Text
  text: {
    primary: '#ffffff',
    secondary: '#b0b0c8',
    tertiary: '#80809f',
    disabled: '#50506f',
  },
  
  // Brand/Accent colors - vibrant EDM palette
  accent: {
    cyan: '#00d9ff',         // Primary action
    magenta: '#ff00ea',      // Secondary action
    yellow: '#ffea00',       // Warning/highlight
    green: '#00ff9f',        // Success
    red: '#ff0055',          // Danger/error
  },
  
  // Pad colors - 16 vibrant options
  pads: [
    '#ff0055', // Red
    '#ff3366', // Pink
    '#ff6699', // Light pink
    '#9933ff', // Purple
    '#6633ff', // Deep purple
    '#3366ff', // Blue
    '#0099ff', // Light blue
    '#00d9ff', // Cyan
    '#00ff9f', // Mint
    '#00ff66', // Green
    '#66ff00', // Lime
    '#ccff00', // Yellow-green
    '#ffea00', // Yellow
    '#ffaa00', // Orange
    '#ff6600', // Deep orange
    '#ff3300', // Red-orange
  ],
  
  // Status
  status: {
    success: '#00ff9f',
    warning: '#ffea00',
    error: '#ff0055',
    info: '#00d9ff',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", monospace',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  glow: {
    cyan: '0 0 20px rgba(0, 217, 255, 0.5)',
    magenta: '0 0 20px rgba(255, 0, 234, 0.5)',
    yellow: '0 0 20px rgba(255, 234, 0, 0.5)',
  },
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '400ms ease-in-out',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  modal: 2000,
  popover: 3000,
  tooltip: 4000,
};
