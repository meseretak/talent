import compression from 'compression';
import cors from 'cors';
import express from 'express';
import promBundle from 'express-prom-bundle';
import helmet from 'helmet';
import http from 'http';
import httpStatus from 'http-status';
import passport from 'passport';
import path from 'path';
import { register } from 'prom-client';
import { Server } from 'socket.io';
import config from './config/config';
import morgan from './config/morgan';
import { configurePassport } from './config/passport';
import { HealthController } from './controllers/v1/health.controller';
import { errorConverter, errorHandler } from './middlewares/error';
import { errorLogger, requestLogger } from './middlewares/logger.middleware';
import { metricsMiddleware as customMetricsMiddleware } from './middlewares/metrics.middleware';
import { authLimiter } from './middlewares/rateLimiter';
import sessionMiddleware from './middlewares/session';
import xss from './middlewares/xss';
import routes from './routes';
import { initializeSocketIO } from './socket';
import ApiError from './utils/ApiError';

// 1. Create basic Express app
const app = express();
const server = http.createServer(app);

// Trust proxy to get the real client IP address
app.set('trust proxy', 1);

// 2. Initialize Socket.IO with explicit path
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: true, // Allow all origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// 3. Initialize Socket.IO handlers
initializeSocketIO(io);

// 4. Add Prometheus middleware (before other middleware)
const metricsBundle = promBundle({
  includeMethod: true,
  includePath: true,
  promClient: {
    collectDefaultMetrics: {},
  },
  normalizePath: [
    ['^/api/v1/users/.*', '/api/v1/users/#id'],
    ['^/api/v1/projects/.*', '/api/v1/projects/#id'],
  ],
});

// Apply metrics middleware early in the chain
app.use(metricsBundle);

// Apply custom metrics middleware
app.use(customMetricsMiddleware);

// Add metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    res.end(await register.metrics());
  } catch (error) {
    console.error('Error serving metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

// 5. Now add Express middleware
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// 6. Skip Socket.IO requests for security middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  helmet()(req, res, next);
});

// parse json request body (skip for webhook routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/webhook')) {
    return next();
  }
  express.json()(req, res, next);
});

// parse urlencoded request body (skip for webhook routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/webhook')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

// sanitize request data - skip for Socket.IO
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  xss()(req, res, next);
});

// gzip compression - skip for Socket.IO
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  compression()(req, res, next);
});

// enable cors - keep this global
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true, // Required for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['set-cookie'], // Expose set-cookie header
  }),
);
app.options('*', cors()); // enable pre-flight

// Create session middleware once

// Configure sessions - use the middleware directly
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  sessionMiddleware(req, res, next);
});

// Share session middleware with Socket.IO
io.engine.use(sessionMiddleware);

// Initialize passport - skip for Socket.IO
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  passport.initialize()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  passport.session()(req, res, next);
});

// Configure passport
configurePassport(passport);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Apply routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files
app.use('/api', routes);

// Add request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', HealthController.check);

// Add error logging middleware
app.use(errorLogger);

// 404 handler - skip for Socket.IO
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Error handlers
app.use(errorConverter);
app.use(errorHandler);

// 4. Export both app and server
export { app, server };
