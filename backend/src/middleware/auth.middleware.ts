/**
 * Authentication Middleware
 * Validates the JWT from the Authorization header and attaches the
 * decoded user payload to req.user for use in protected routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: {
    id:    string;
    email: string;
    role:  string;
  };
}

export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required — no token provided');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id:    string;
      email: string;
      role:  string;
    };

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('_id email role isActive');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User no longer exists or has been deactivated');
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional auth middleware — attaches req.user if token is present,
 * but does NOT reject the request if there is no token.
 * Used on routes like product listing that are public but personalisable.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string; email: string; role: string;
      };
      req.user = decoded;
    }
    next();
  } catch {
    // Token invalid or absent — continue as unauthenticated
    next();
  }
};
