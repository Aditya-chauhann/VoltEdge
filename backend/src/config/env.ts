/**
 * Environment variable validation and typed access.
 * All required env vars are validated at startup — the app refuses to
 * launch if any are missing, preventing silent misconfiguration.
 */

import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env = {
  // Server
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT:     parseInt(optionalEnv('PORT', '5000'), 10),

  // MongoDB
  MONGODB_URI: requireEnv('MONGODB_URI'),

  // JWT & Admin
  JWT_SECRET:     requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),
  ADMIN_SECRET:   optionalEnv('ADMIN_SECRET', 'Admin@123456'),

  // CORS
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),

  // CJ Dropshipping
  CJ_EMAIL:   requireEnv('CJ_EMAIL'),
  CJ_API_KEY: requireEnv('CJ_API_KEY'),

  // Stripe
  STRIPE_SECRET_KEY:      optionalEnv('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET:  optionalEnv('STRIPE_WEBHOOK_SECRET', ''),

  // CJ Dropshipping API & Settings
  CJ_API_BASE_URL: optionalEnv('CJ_API_BASE_URL', 'https://developers.cjdropshipping.com/api2.0/v1'),
  CJ_MOCK_MODE: optionalEnv('CJ_MOCK_MODE', 'false') === 'true',
  CJ_API_MIN_INTERVAL_MS: parseInt(optionalEnv('CJ_API_MIN_INTERVAL_MS', '1000'), 10),
  CJ_FROM_COUNTRY_CODE: optionalEnv('CJ_FROM_COUNTRY_CODE', 'CN'),
  CJ_LOGISTIC_NAME: optionalEnv('CJ_LOGISTIC_NAME', 'CJPacket'),
  SANDBOX_MODE: optionalEnv('SANDBOX_MODE', 'false') === 'true',
  CJ_ORDER_PAY_TYPE: optionalEnv('CJ_ORDER_PAY_TYPE', '1'),
  CJ_HOME_CATEGORY_FIRST_ID: optionalEnv('CJ_HOME_CATEGORY_FIRST_ID', ''),
  CJ_HOME_CATEGORY_FIRST_NAME: optionalEnv('CJ_HOME_CATEGORY_FIRST_NAME', ''),

  // Redis Settings
  REDIS_URL: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  REDIS_PRODUCT_TTL: parseInt(optionalEnv('REDIS_PRODUCT_TTL', '3600'), 10),
  REDIS_CATEGORY_TTL: parseInt(optionalEnv('REDIS_CATEGORY_TTL', '86400'), 10),
  REDIS_CART_TTL: parseInt(optionalEnv('REDIS_CART_TTL', '604800'), 10),

  // Pricing
  PRICE_MARKUP_PERCENTAGE: parseFloat(optionalEnv('PRICE_MARKUP_PERCENTAGE', '30')),

  // Email/SMTP (Optional for now)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  get isProduction() {
    return this.NODE_ENV === 'production';
  },
  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },
} as const;
