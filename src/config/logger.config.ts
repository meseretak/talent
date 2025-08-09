import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import LokiTransport from 'winston-loki';
import config from './config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

// Custom format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Create daily rotate file transports
const errorRotateFile = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat as any,
}) as unknown as winston.transport;

const combinedRotateFile = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat as any,
}) as unknown as winston.transport;

// Create Loki transport
const lokiTransport = new LokiTransport({
  host: config.loki?.host || 'http://172.17.0.1:3100',
  labels: {
    app: 'outsourcing_backend',
    env: process.env.NODE_ENV || 'development',
  },
  json: true,
  format: winston.format.json(),
  replaceTimestamp: true,
  onConnectionError: (err) => console.error('Loki connection error:', err),
});

// Create transports array
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  errorRotateFile,
  combinedRotateFile,
  lokiTransport,
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

export default logger;
