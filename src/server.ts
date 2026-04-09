import app from './app';
import logger from './utils/logger';
import './config/database';
import './config/redis';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor a correr na porta ${PORT}`);
  logger.info(`📚 Gestão Escolar API - Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. A encerrar servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. A encerrar servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});
