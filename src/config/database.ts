import knex, { Knex } from 'knex';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const dbConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gestao_escolar',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../../database/migrations',
  },
  seeds: {
    directory: '../../database/seeds',
  },
};

const db = knex(dbConfig);

db.raw('SELECT 1')
  .then(() => logger.info('PostgreSQL conectado com sucesso'))
  .catch((err) => logger.error('Erro ao conectar PostgreSQL:', err));

export default db;
export { dbConfig };
