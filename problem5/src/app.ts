import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { requestLogger } from './middleware/requestLogger.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { sanitizeBody } from './middleware/validate.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import authRoutes from './routes/auth.routes';
import resourceRoutes from './routes/resource.routes';
import { checkDatabaseConnection } from './config/database';
import { logger } from './config/logger';

/**
 * Create and configure Express application
 * Following 12-Factor App principles and SOLID design
 */
export function createApp(): Application {
  const app: Application = express();

  // ===== Security Middleware =====

  // Helmet: Sets various HTTP headers for security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
          scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
          imgSrc: ["'self'", 'data:', 'https:'], // For Swagger UI
        },
      },
      crossOriginEmbedderPolicy: false, // For Swagger UI
    })
  );

  // CORS: Configure cross-origin resource sharing
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  };
  app.use(cors(corsOptions));

  // Compression: Gzip compression for responses
  app.use(compression());

  // ===== Body Parsing Middleware =====
  app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

  // ===== Input Sanitization =====
  app.use(sanitizeBody); // Sanitize request body to prevent injection attacks

  // ===== Rate Limiting =====
  app.use(apiLimiter); // Global rate limiter

  // ===== Request Logging =====
  app.use(requestLogger); // Log all requests/responses

  // ===== API Documentation =====
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ===== Health Check Endpoint =====
  app.get('/health', async (req, res) => {
    const dbHealthy = await checkDatabaseConnection();

    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  });

  // ===== API Routes =====
  app.use('/api/auth', authRoutes);
  app.use('/api/resources', resourceRoutes);

  // ===== Root endpoint =====
  app.get('/', (req, res) => {
    res.json({
      name: 'Express CRUD API',
      version: '1.0.0',
      description: 'Production-ready Express.js + TypeScript CRUD API',
      documentation: `${req.protocol}://${req.get('host')}/api-docs`,
      health: `${req.protocol}://${req.get('host')}/health`,
    });
  });

  // ===== Error Handling =====
  app.use(notFoundHandler); // 404 handler
  app.use(errorHandler); // Global error handler

  return app;
}

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
import { dirname } from 'path';

try {
  mkdirSync(dirname('./logs/app.log'), { recursive: true });
} catch (error) {
  logger.warn('Could not create logs directory', { error });
}
