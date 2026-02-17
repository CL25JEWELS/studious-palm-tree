/**
 * Base error interface for all internal errors.
 * Uses discriminator pattern for type-safe error handling.
 */
export interface BaseError {
  readonly kind: string;
  readonly message: string;
  readonly timestamp: number;
}

/**
 * Audio-related error types
 */
export interface AudioContextError extends BaseError {
  readonly kind: 'AudioContextError';
  readonly reason: 'initialization_failed' | 'context_suspended' | 'context_closed';
}

export interface BufferLoadError extends BaseError {
  readonly kind: 'BufferLoadError';
  readonly url: string;
  readonly statusCode?: number;
}

export interface InvalidSampleRateError extends BaseError {
  readonly kind: 'InvalidSampleRateError';
  readonly providedRate: number;
  readonly supportedRates: number[];
}

/**
 * Transport-related error types
 */
export interface TransportError extends BaseError {
  readonly kind: 'TransportError';
  readonly operation: 'start' | 'stop' | 'seek' | 'schedule';
  readonly state: string;
}

export interface TimingError extends BaseError {
  readonly kind: 'TimingError';
  readonly expectedTime: number;
  readonly actualTime: number;
}

/**
 * Resource-related error types
 */
export interface ResourceNotFoundError extends BaseError {
  readonly kind: 'ResourceNotFoundError';
  readonly resourceType: 'sample' | 'preset' | 'track';
  readonly resourceId: string;
}

export interface ResourceLimitError extends BaseError {
  readonly kind: 'ResourceLimitError';
  readonly resourceType: 'voices' | 'buffers' | 'tracks';
  readonly limit: number;
  readonly requested: number;
}

/**
 * Configuration error types
 */
export interface ConfigValidationError extends BaseError {
  readonly kind: 'ConfigValidationError';
  readonly field: string;
  readonly invalidValue: unknown;
  readonly constraints: string[];
}

/**
 * Union type of all possible errors
 */
export type LoopPadError =
  | AudioContextError
  | BufferLoadError
  | InvalidSampleRateError
  | TransportError
  | TimingError
  | ResourceNotFoundError
  | ResourceLimitError
  | ConfigValidationError;

/**
 * Type guard functions for discriminating between error types
 */
export function isAudioContextError(error: LoopPadError): error is AudioContextError {
  return error.kind === 'AudioContextError';
}

export function isBufferLoadError(error: LoopPadError): error is BufferLoadError {
  return error.kind === 'BufferLoadError';
}

export function isInvalidSampleRateError(error: LoopPadError): error is InvalidSampleRateError {
  return error.kind === 'InvalidSampleRateError';
}

export function isTransportError(error: LoopPadError): error is TransportError {
  return error.kind === 'TransportError';
}

export function isTimingError(error: LoopPadError): error is TimingError {
  return error.kind === 'TimingError';
}

export function isResourceNotFoundError(error: LoopPadError): error is ResourceNotFoundError {
  return error.kind === 'ResourceNotFoundError';
}

export function isResourceLimitError(error: LoopPadError): error is ResourceLimitError {
  return error.kind === 'ResourceLimitError';
}

export function isConfigValidationError(error: LoopPadError): error is ConfigValidationError {
  return error.kind === 'ConfigValidationError';
}

/**
 * Error factory functions
 */
export function createAudioContextError(
  reason: AudioContextError['reason'],
  message: string
): AudioContextError {
  return {
    kind: 'AudioContextError',
    reason,
    message,
    timestamp: Date.now(),
  };
}

export function createBufferLoadError(
  url: string,
  message: string,
  statusCode?: number
): BufferLoadError {
  return {
    kind: 'BufferLoadError',
    url,
    message,
    statusCode,
    timestamp: Date.now(),
  };
}

export function createInvalidSampleRateError(
  providedRate: number,
  supportedRates: number[]
): InvalidSampleRateError {
  return {
    kind: 'InvalidSampleRateError',
    providedRate,
    supportedRates,
    message: `Invalid sample rate ${providedRate}. Supported rates: ${supportedRates.join(', ')}`,
    timestamp: Date.now(),
  };
}

export function createTransportError(
  operation: TransportError['operation'],
  state: string,
  message: string
): TransportError {
  return {
    kind: 'TransportError',
    operation,
    state,
    message,
    timestamp: Date.now(),
  };
}

export function createTimingError(
  expectedTime: number,
  actualTime: number
): TimingError {
  return {
    kind: 'TimingError',
    expectedTime,
    actualTime,
    message: `Timing mismatch: expected ${expectedTime}, got ${actualTime}`,
    timestamp: Date.now(),
  };
}

export function createResourceNotFoundError(
  resourceType: ResourceNotFoundError['resourceType'],
  resourceId: string
): ResourceNotFoundError {
  return {
    kind: 'ResourceNotFoundError',
    resourceType,
    resourceId,
    message: `${resourceType} not found: ${resourceId}`,
    timestamp: Date.now(),
  };
}

export function createResourceLimitError(
  resourceType: ResourceLimitError['resourceType'],
  limit: number,
  requested: number
): ResourceLimitError {
  return {
    kind: 'ResourceLimitError',
    resourceType,
    limit,
    requested,
    message: `Resource limit exceeded: ${resourceType} limit is ${limit}, requested ${requested}`,
    timestamp: Date.now(),
  };
}

export function createConfigValidationError(
  field: string,
  invalidValue: unknown,
  constraints: string[]
): ConfigValidationError {
  return {
    kind: 'ConfigValidationError',
    field,
    invalidValue,
    constraints,
    message: `Invalid configuration for ${field}: ${constraints.join(', ')}`,
    timestamp: Date.now(),
  };
}
