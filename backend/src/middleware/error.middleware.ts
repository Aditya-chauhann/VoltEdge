/**
 * Global Error Handling Middleware
 * Catches all errors passed via next(error) and returns a consistent
 * JSON error response. Distinguishes operational (ApiError) from
 * unexpected programming errors.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default to 500 for unexpected errors
  let statusCode = 500;
  let message    = 'An unexpected server error occurred';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message    = err.message;
  } else if ((err as { name?: string }).name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 422;
    message    = 'Validation failed';
    errors     = Object.values(
      (err as { errors?: Record<string, { message: string }> }).errors ?? {},
    ).map((e) => e.message);
  } else if ((err as { code?: number }).code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(
      (err as { keyValue?: Record<string, unknown> }).keyValue ?? {},
    )[0];
    message = `${field} already exists`;
  } else if ((err as { name?: string }).name === 'CastError') {
    statusCode = 400;
    message    = 'Invalid ID format';
  }

  // Log stack trace in development
  if (env.isDevelopment) {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success:    false,
    message,
    ...(errors.length > 0 && { errors }),
    // Only expose stack in development
    ...(env.isDevelopment && { stack: err.stack }),
  });
};

/** 404 handler — must be registered AFTER all other routes */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
