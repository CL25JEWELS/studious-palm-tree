/**
 * Global styles for LoopPad web app
 */

import { colors, typography } from './design-system';

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.md};
    line-height: ${typography.lineHeight.normal};
    color: ${colors.text.primary};
    background: ${colors.bg.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.bg.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.surface.default};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.surface.hover};
  }
`;
