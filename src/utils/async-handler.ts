import { NextFunction, Request, Response } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async Express route handler to automatically catch and forward errors to the error middleware
 * @param fn The async route handler function
 * @returns A wrapped function that forwards errors to next()
 */
export const asyncHandler =
  (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
