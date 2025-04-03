/**
 * Not found middleware for NANDA server
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Not found handling middleware
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error: Error & { status?: number } = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}