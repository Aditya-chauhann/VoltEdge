/**
 * Custom application error class.
 * Extends the built-in Error with an HTTP status code so the global
 * error middleware can send consistent JSON error responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);

    // Capture stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }
}
