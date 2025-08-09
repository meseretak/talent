import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import PolicyEngine from '../abac/engine';
import logger from '../config/logger';
import { User } from '../generated/prisma';
import ApiError from '../utils/ApiError';

export interface AuthorizationContext {
  resource: {
    type: string;
    id?: number | string;
    [key: string]: any;
  };
  action: string;
}

const authorize = (context: AuthorizationContext | ((req: Request) => AuthorizationContext)) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PolicyEngine.initializeFromFiles();

      const authContext = typeof context === 'function' ? context(req) : context;
      const user = req.user as User;

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      let locationData = null;

      try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        locationData = response.data;
      } catch (error) {
        logger.error('Failed to fetch location data:', error);
      }

      const allowed = PolicyEngine.evaluate({
        user: {
          ...user,
          role: [user.role],
          id: user.id.toString(), // Move id after spread to ensure it's string
        },
        resource: {
          ...authContext.resource,
          type: authContext.resource.type, // Move type after spread
          id: authContext.resource.id?.toString(),
          ownerId: authContext.resource.ownerId?.toString(),
        },
        action: authContext.action,
        environment: {
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          ip: req.ip,
          location: locationData,
        },
      });

      if (!allowed) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
