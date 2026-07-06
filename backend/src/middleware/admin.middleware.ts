/**
 * Admin Middleware
 * Must be used AFTER the protect middleware — checks that the
 * authenticated user has role "admin".
 */

import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from './auth.middleware';

export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
};
