/**
 * cluster.ts — Run one Express worker per CPU core.
 * Handles high traffic by using Node.js cluster module.
 * Run with: node dist/cluster.js
 */
import cluster from 'cluster';
import os from 'os';
import { logger } from './services/logger';

const NUM_WORKERS = process.env.WEB_CONCURRENCY
  ? parseInt(process.env.WEB_CONCURRENCY)
  : os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`🧠 Primary PID ${process.pid} — forking ${NUM_WORKERS} workers`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker PID ${worker.process.pid} died (${signal || code}). Restarting…`);
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    logger.info(`Worker PID ${worker.process.pid} is online`);
  });
} else {
  // Each worker runs the full Express app
  require('./index');
}
