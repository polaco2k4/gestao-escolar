import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';
const defaultMax = isDev ? 2000 : 300;

export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || defaultMax,
  message: {
    success: false,
    message: 'Demasiados pedidos. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas tentativas de login. Tente novamente em 15 minutos.',
  },
});
