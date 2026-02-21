/**
 * Result type for operations that can fail
 */
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Helper functions for Result type
 */
export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function failure<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isFailure<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}
