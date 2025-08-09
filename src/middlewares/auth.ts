import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { roleRights } from '../config/roles';
import { User } from '../generated/prisma';
import ApiError from '../utils/ApiError';

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated via session
    if (!req.isAuthenticated()) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    const user = req.user as User;

    // Check user rights if any are required
    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) ?? [];
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight),
      );

      if (!hasRequiredRights && req.params.userId !== user.id.toString()) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    return next();
  };

export default auth;
