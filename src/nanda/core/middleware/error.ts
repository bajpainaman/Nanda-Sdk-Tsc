/**
 * Error middleware for NANDA server
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Error response interface
 */
export interface IErrorResponse {
  status: number;
  message: string;
  error: string;
  details?: unknown;
}

/**
 * Error handling middleware
 */
export function errorMiddleware(
  err: Error & { status?: number; errors?: unknown },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  const errorName = err.name || 'InternalServerError';
  const details = err.errors;

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${errorName}: ${message}`, err);
  }

  // Send error response
  const errorResponse: IErrorResponse = {
    status,
    message,
    error: errorName,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.details = details;
  }

  res.status(status).json(errorResponse);
}