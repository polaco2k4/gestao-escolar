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
    console.log('🔄 A executar migração 005...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/005_fix_student_number_unique_per_school.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await db.raw(sql);
    
    console.log('✅ Migração 005 executada com sucesso!');
    console.log('📊 Número de estudante agora é único por escola (não globalmente).');
    console.log('');
    console.log('Agora cada escola pode ter seu próprio estudante com o mesmo número.');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigration();
