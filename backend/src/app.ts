/**
 * VoltEdge Backend — Express Application Entry Point
 *
 * Boot sequence:
 *  1. Load & validate environment variables
 *  2. Connect to MongoDB
 *  3. Set up Express app (security, CORS, body parsing, routes)
 *  4. Start the HTTP server
 *  5. Start the CJ product sync cron job
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter';
// Sync imports removed

// Routes
import authRoutes     from './routes/auth.routes';
import productRoutes  from './routes/product.routes';
import cartRoutes     from './routes/cart.routes';
import orderRoutes    from './routes/order.routes';
import wishlistRoutes from './routes/wishlist.routes';
import reviewRoutes   from './routes/review.routes';
import couponRoutes   from './routes/coupon.routes';
import adminRoutes    from './routes/admin.routes';
import webhookRoutes  from './routes/webhook.routes';

// Initialize cron jobs
import './cron';

// ─────────────────────────────────────────────────────────────────────────────
// Create Express app
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(generalLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin) or listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Just log the error, don't crash, but allow it for now if there is a mismatch
        console.warn(`CORS Warning: origin "${origin}" not in allowed list: ${allowedOrigins.join(', ')}`);
        // For development/debugging phase, let's allow it if it's vercel
        if (origin.includes('vercel.app') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin "${origin}" not allowed`));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
// Webhook route needs raw body for HMAC verification — register BEFORE express.json()
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }));

// All other routes get parsed JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Compression & logging ─────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'VoltEdge API',
    version: '1.0.0',
    env:     env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/products',         productRoutes);
app.use('/api/cart',             cartRoutes);
app.use('/api/orders',           orderRoutes);
app.use('/api/wishlist',         wishlistRoutes);
app.use('/api/reviews',          reviewRoutes);
app.use('/api/coupons',          couponRoutes);
app.use('/api/admin',            adminRoutes);
app.use('/api/webhooks/razorpay', webhookRoutes);

// ── 404 & error handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────

async function bootstrap() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀  VoltEdge API running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Health: http://localhost:${env.PORT}/health\n`);
    });

    // Sync jobs removed, using proxy-cache now

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

export default app;
