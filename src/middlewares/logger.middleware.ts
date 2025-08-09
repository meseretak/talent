import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import logger from '../config/logger.config';

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message: string) => {
    // Remove the last newline character
    const logMessage = message.trim();
    logger.http(logMessage);
  },
};

// Custom token for request ID
morgan.token('request-id', (req: Request) => req.headers['x-request-id'] as string);

// Custom format that includes timestamp, request ID, method, URL, status, and response time
const logFormat = ':method :url :status :response-time ms - :res[content-length] :request-id';

// Skip function to ignore health check endpoints
const skip = (req: Request) => {
  return req.url === '/api/health';
};

// Export the morgan middleware
export const requestLogger = morgan(logFormat, { stream, skip });

// Export a middleware to handle errors and log them
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  next(err);
};
