/**
 * Example: Error Handling Patterns
 * 
 * This example demonstrates comprehensive error handling using the
 * discriminator-based error system.
 */

import {
  Result,
  isSuccess,
  isFailure,
  LoopPadError,
  isAudioContextError,
  isBufferLoadError,
  isInvalidSampleRateError,
  isTransportError,
  isTimingError,
  isResourceNotFoundError,
  isResourceLimitError,
  isConfigValidationError,
  createAudioContextError,
  createBufferLoadError,
  createResourceLimitError,
} from '../internal';

/**
 * Example 1: Exhaustive error handling with type safety
 */
function handleError(error: LoopPadError): string {
  // The discriminator pattern ensures type safety
  if (isAudioContextError(error)) {
    // TypeScript knows error is AudioContextError here
    switch (error.reason) {
      case 'initialization_failed':
        return 'Failed to initialize audio context. Please refresh the page.';
      case 'context_suspended':
        return 'Audio context is suspended. Click to resume.';
      case 'context_closed':
        return 'Audio context was closed. Please reload the application.';
    }
  }

  if (isBufferLoadError(error)) {
    // TypeScript knows error is BufferLoadError here
    if (error.statusCode === 404) {
      return `Sound file not found: ${error.url}`;
    }
    if (error.statusCode === 403) {
      return `Access denied to sound file: ${error.url}`;
    }
    return `Failed to load sound: ${error.message}`;
  }

  if (isInvalidSampleRateError(error)) {
    // TypeScript knows error is InvalidSampleRateError here
    return `Invalid sample rate ${error.providedRate}. Supported: ${error.supportedRates.join(', ')}`;
  }

  if (isTransportError(error)) {
    // TypeScript knows error is TransportError here
    return `Transport ${error.operation} failed while in ${error.state} state: ${error.message}`;
  }

  if (isTimingError(error)) {
    // TypeScript knows error is TimingError here
    return `Timing error: expected ${error.expectedTime}s, got ${error.actualTime}s`;
  }

  if (isResourceNotFoundError(error)) {
    // TypeScript knows error is ResourceNotFoundError here
    return `${error.resourceType} not found: ${error.resourceId}`;
  }

  if (isResourceLimitError(error)) {
    // TypeScript knows error is ResourceLimitError here
    return `${error.resourceType} limit exceeded: ${error.requested} requested, ${error.limit} available`;
  }

  if (isConfigValidationError(error)) {
    // TypeScript knows error is ConfigValidationError here
    return `Invalid configuration for ${error.field}: ${error.constraints.join(', ')}`;
  }

  // This should never be reached due to exhaustive checking
  const _exhaustiveCheck: never = error;
  return _exhaustiveCheck; // This line will never execute
}

/**
 * Example 2: Error recovery strategies
 */
async function withRetry<T>(
  operation: () => Result<T, LoopPadError>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Result<T, LoopPadError>> {
  let lastError: LoopPadError | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = operation();
    
    if (isSuccess(result)) {
      return result;
    }

    lastError = result.error;

    // Only retry on specific error types
    if (isAudioContextError(result.error) && result.error.reason === 'context_suspended') {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }

    if (isBufferLoadError(result.error)) {
      // Could retry network errors
      if (result.error.statusCode && result.error.statusCode >= 500) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
    }

    // Don't retry other error types
    return result;
  }

  // All retries failed
  return {
    ok: false,
    error: lastError ?? createAudioContextError('initialization_failed', 'Operation failed after retries'),
  };
}

/**
 * Example 3: Error aggregation for batch operations
 */
function batchLoadSounds(
  urls: string[],
  loadFn: (url: string) => Result<AudioBuffer, LoopPadError>
): Result<Map<string, AudioBuffer>, LoopPadError[]> {
  const buffers = new Map<string, AudioBuffer>();
  const errors: LoopPadError[] = [];

  for (const url of urls) {
    const result = loadFn(url);
    
    if (isSuccess(result)) {
      buffers.set(url, result.value);
    } else {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    return { ok: false, error: errors };
  }

  return { ok: true, value: buffers };
}

/**
 * Example 4: Graceful degradation
 */
function initializeWithFallback(
  preferredSampleRate: number,
  fallbackSampleRates: number[],
  initFn: (sampleRate: number) => Result<void, LoopPadError>
): Result<number, LoopPadError> {
  // Try preferred rate first
  const preferredResult = initFn(preferredSampleRate);
  
  if (isSuccess(preferredResult)) {
    return { ok: true, value: preferredSampleRate };
  }

  // If it's not a sample rate error, fail immediately
  if (!isInvalidSampleRateError(preferredResult.error)) {
    return preferredResult;
  }

  // Try fallback rates
  for (const fallbackRate of fallbackSampleRates) {
    const fallbackResult = initFn(fallbackRate);
    
    if (isSuccess(fallbackResult)) {
      console.warn(
        `Fell back to sample rate ${fallbackRate} (preferred: ${preferredSampleRate})`
      );
      return { ok: true, value: fallbackRate };
    }
  }

  // All attempts failed
  return preferredResult;
}

/**
 * Example 5: Error logging and monitoring
 */
class ErrorMonitor {
  private errorCounts = new Map<string, number>();
  private recentErrors: Array<{ error: LoopPadError; timestamp: number }> = [];
  private readonly maxRecentErrors = 100;

  recordError(error: LoopPadError): void {
    // Update error counts
    const count = this.errorCounts.get(error.kind) ?? 0;
    this.errorCounts.set(error.kind, count + 1);

    // Store recent errors
    this.recentErrors.push({ error, timestamp: Date.now() });
    
    // Trim old errors
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.shift();
    }

    // Log based on error type
    this.logError(error);

    // Alert if error rate is too high
    this.checkErrorRate(error.kind);
  }

  private logError(error: LoopPadError): void {
    const message = handleError(error);
    
    // Log with appropriate severity
    if (isResourceLimitError(error) || isTimingError(error)) {
      console.warn(`[${error.kind}] ${message}`);
    } else if (isConfigValidationError(error)) {
      console.error(`[${error.kind}] ${message}`, error);
    } else {
      console.error(`[${error.kind}] ${message}`);
    }
  }

  private checkErrorRate(kind: string): void {
    const recentCount = this.recentErrors.filter(
      e => e.error.kind === kind && Date.now() - e.timestamp < 60000 // last minute
    ).length;

    if (recentCount > 10) {
      console.error(`High error rate detected: ${kind} occurred ${recentCount} times in the last minute`);
    }
  }

  getErrorStats(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  getRecentErrors(count: number = 10): LoopPadError[] {
    return this.recentErrors
      .slice(-count)
      .map(e => e.error);
  }

  clearErrors(): void {
    this.errorCounts.clear();
    this.recentErrors = [];
  }
}

/**
 * Example 6: Error boundary for operation chains
 */
async function safeOperation<T>(
  operation: () => Promise<Result<T, LoopPadError>>,
  errorMonitor: ErrorMonitor,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    const result = await operation();
    
    if (isSuccess(result)) {
      return result.value;
    }

    // Record the error
    errorMonitor.recordError(result.error);

    // Return fallback if available
    return fallbackValue;
  } catch (e) {
    // Handle unexpected exceptions
    const error = createBufferLoadError(
      'unknown',
      e instanceof Error ? e.message : 'Unknown error'
    );
    errorMonitor.recordError(error);
    return fallbackValue;
  }
}

/**
 * Example 7: User-friendly error messages
 */
function getUserFriendlyMessage(error: LoopPadError): {
  title: string;
  message: string;
  action?: string;
} {
  if (isAudioContextError(error)) {
    switch (error.reason) {
      case 'initialization_failed':
        return {
          title: 'Audio Setup Failed',
          message: 'We couldn\'t initialize the audio system.',
          action: 'Please refresh the page and try again.',
        };
      case 'context_suspended':
        return {
          title: 'Audio Paused',
          message: 'Audio playback was automatically paused.',
          action: 'Click anywhere to resume audio.',
        };
      case 'context_closed':
        return {
          title: 'Audio Disconnected',
          message: 'The audio system was disconnected.',
          action: 'Please reload the application.',
        };
    }
  }

  if (isBufferLoadError(error)) {
    return {
      title: 'Sound Loading Failed',
      message: `Couldn't load the sound file.`,
      action: 'Check your internet connection and try again.',
    };
  }

  if (isResourceLimitError(error)) {
    return {
      title: 'Resource Limit Reached',
      message: `You've reached the maximum number of ${error.resourceType}.`,
      action: 'Stop some sounds before adding more.',
    };
  }

  return {
    title: 'Something Went Wrong',
    message: error.message,
    action: 'Please try again.',
  };
}

export {
  handleError,
  withRetry,
  batchLoadSounds,
  initializeWithFallback,
  ErrorMonitor,
  safeOperation,
  getUserFriendlyMessage,
};
