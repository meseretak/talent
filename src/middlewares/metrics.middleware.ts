import { NextFunction, Request, Response } from 'express';
import { recordApiRequest, recordError } from '../services/metrics.service';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response data
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    const endpoint = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;

    // Record API request metrics
    recordApiRequest(method, endpoint, status, duration);

    // Record errors
    if (status >= 400) {
      const errorType = status >= 500 ? 'server_error' : 'client_error';
      recordError(errorType, endpoint);
    }

    // Call original send
    return originalSend.call(this, body);
  };

  next();
};
