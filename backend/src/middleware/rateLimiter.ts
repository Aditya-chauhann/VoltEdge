/**
 * Rate Limiters
 * Per-route rate limiting to protect against brute-force attacks and abuse.
 */

import rateLimit from 'express-rate-limit';

/** Strict limiter for auth routes (login, register, forgot-password) */
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

/** General API limiter — applied globally */
export const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              500,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Too many requests, please slow down',
  },
});

/** Strict limiter for Razorpay webhook endpoint */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      60,
  standardHeaders: true,
  legacyHeaders:   false,
});
