import Redis from 'ioredis';
import logger from '../utils/logger';

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  redis.on('connect', () => {
    logger.info('✅ Redis conectado');
  });

  redis.on('error', (err) => {
    logger.warn('⚠️ Redis não disponível (opcional para desenvolvimento):', err.message);
  });

  redis.connect().catch(() => {
    logger.warn('⚠️ Redis não está a correr. Continuando sem cache...');
    redis = null;
  });
} catch (error) {
  logger.warn('⚠️ Redis não configurado. Continuando sem cache...');
  redis = null;
}

export default redis;
