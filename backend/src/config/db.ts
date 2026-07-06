/**
 * MongoDB connection management using Mongoose.
 * Implements a singleton connection pattern safe for Railway/production.
 */

import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Recommended options for production reliability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌  MongoDB connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown — close the connection when the process exits
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴  MongoDB connection closed (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('📴  MongoDB connection closed (SIGTERM)');
  process.exit(0);
});
