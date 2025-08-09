import httpStatus from 'http-status';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestException extends ApiError {
  constructor(message: string) {
    super(httpStatus.BAD_REQUEST, message);
    this.name = 'BadRequestException';
  }
}

export class NotFoundException extends ApiError {
  constructor(message: string) {
    super(httpStatus.NOT_FOUND, message);
    this.name = 'NotFoundException';
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message: string) {
    super(httpStatus.UNAUTHORIZED, message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends ApiError {
  constructor(message: string) {
    super(httpStatus.FORBIDDEN, message);
    this.name = 'ForbiddenException';
  }
}

// Export all exceptions
export default {
  ApiError,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
};
