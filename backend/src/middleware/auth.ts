import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';
import { UserRole } from '../types/index.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized: Missing or invalid token', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Unauthorized: Invalid or expired token', 401);
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore if optional
    }
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Unauthorized: Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      throw new AppError(
        `Forbidden: Insufficient privileges. Required role(s): ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
}
