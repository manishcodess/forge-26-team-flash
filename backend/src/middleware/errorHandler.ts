import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(`[API Error] ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
  });
}
