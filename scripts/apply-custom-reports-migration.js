const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Aplicando migration de relatórios personalizados...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/007_create_custom_reports.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migration aplicada com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - custom_reports (relatórios personalizados)');
    console.log('   - report_executions (histórico de execuções)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao aplicar migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na aplicação da migration:', error);
    process.exit(1);
  });
