import logger from '../config/logger.config';

export default {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },
};
