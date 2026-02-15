/**
 * Error classes for EchoForge
 */

/**
 * Base audio engine error
 */
export class AudioEngineError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AudioEngineError';
  }
}

/**
 * Instrument loading error
 */
export class InstrumentLoadError extends AudioEngineError {
  constructor(
    message: string,
    public instrumentId: string
  ) {
    super(message, 'INSTRUMENT_LOAD_ERROR');
  }
}

/**
 * Pad not found error
 */
export class PadNotFoundError extends AudioEngineError {
  constructor(public padId: string) {
    super(`Pad not found: ${padId}`, 'PAD_NOT_FOUND');
  }
}

/**
 * Project loading error
 */
export class ProjectLoadError extends Error {
  constructor(
    message: string,
    public projectId: string
  ) {
    super(message);
    this.name = 'ProjectLoadError';
  }
}

/**
 * Project saving error
 */
export class ProjectSaveError extends Error {
  constructor(
    message: string,
    public projectId: string
  ) {
    super(message);
    this.name = 'ProjectSaveError';
  }
}

/**
 * Project import error
 */
export class ProjectImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectImportError';
  }
}

/**
 * Project sync error
 */
export class ProjectSyncError extends Error {
  constructor(
    message: string,
    public projectId: string
  ) {
    super(message);
    this.name = 'ProjectSyncError';
  }
}
