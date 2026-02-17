/**
 * Internal API Surface
 * 
 * This module defines the internal architecture with clear module boundaries.
 * These interfaces are used for internal implementation and extension points.
 * 
 * Public API consumers should use the exports from the main index.ts
 */

// Error types and utilities
export * from './errors/BaseError';

// Result type for error handling
export * from './types/Result';

// Configuration interfaces
export * from './types/Config';

// Module interfaces
export * from './modules/AudioModules';
