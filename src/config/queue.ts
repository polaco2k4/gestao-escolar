import { Queue, Worker } from 'bullmq';
import redis from './redis';
import logger from '../utils/logger';

let queuesEnabled = redis !== null;

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function createQueue(name: string): Queue | null {
  if (!queuesEnabled) {
    logger.warn(`⚠️ Queue "${name}" não criada (Redis não disponível)`);
    return null;
  }
  try {
    return new Queue(name, { connection });
  } catch (error) {
    logger.warn(`⚠️ Erro ao criar queue "${name}"`);
    queuesEnabled = false;
    return null;
  }
}

export function createWorker(name: string, processor: any): Worker | null {
  if (!queuesEnabled) return null;
  try {
    return new Worker(name, processor, { connection });
  } catch (error) {
    logger.warn(`⚠️ Erro ao criar worker "${name}"`);
    return null;
  }
}

export const emailQueue = createQueue('email');
export const smsQueue = createQueue('sms');
export const reportQueue = createQueue('reports');
