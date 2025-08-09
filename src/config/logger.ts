import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import LokiTransport from 'winston-loki';
import path from 'path';
import config from './config';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

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
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.json(),
  ),
}) as unknown as winston.transport;

const combinedRotateFile = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.json(),
  ),
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
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
      winston.format.splat(),
      winston.format.printf(({ level, message }) => `${level}: ${message}`),
    ),
    stderrLevels: ['error'],
  }),
  errorRotateFile,
  combinedRotateFile,
  lokiTransport,
];

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  transports,
  exitOnError: false,
});

export default logger;
