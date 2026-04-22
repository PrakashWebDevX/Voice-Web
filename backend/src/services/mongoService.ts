import mongoose from 'mongoose';
import { logger } from './logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE) || 20;

  try {
    await mongoose.connect(uri, {
      maxPoolSize,           // handle up to N concurrent operations
      minPoolSize: 5,        // keep at least 5 connections alive
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    isConnected = true;
    logger.info(`✅ MongoDB connected (pool: ${maxPoolSize})`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
      isConnected = false;
    });
    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
      isConnected = true;
    });
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err.message);
    });
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

export default mongoose;
