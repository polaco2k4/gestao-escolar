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

async function addGestorRole() {
  try {
    console.log('🔄 A adicionar role "gestor" à base de dados...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_gestor_role.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await db.raw(sql);
    
    console.log('✅ Role "gestor" adicionada com sucesso!');
    
    // Verificar a constraint
    const constraint = await db.raw(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname = 'users_role_check';
    `);
    
    if (constraint.rows.length > 0) {
      console.log('\n📋 Constraint atualizada:');
      console.log(`   ${constraint.rows[0].definition}`);
    }
    
    console.log('\n✨ Agora pode criar utilizadores com role "gestor"!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar role gestor:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Dica: A constraint pode já ter sido atualizada ou não existir.');
    }
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

addGestorRole();
