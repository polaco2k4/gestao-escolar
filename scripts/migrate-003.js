const fs = require('fs');
const path = require('path');
const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gestao_escolar',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
});

async function runMigration() {
  try {
    console.log('🔄 A executar migração 003...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/003_add_school_id_to_student_fees.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await db.raw(sql);
    
    console.log('✅ Migração 003 executada com sucesso!');
    console.log('📊 Coluna school_id adicionada à tabela student_fees.');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigration();
