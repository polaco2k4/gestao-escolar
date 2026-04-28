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
    console.log('🔄 A executar migração 005 - Sistema de Licenças...');
    console.log('');
    
    const migrationPath = path.join(__dirname, '../database/migrations/005_create_licenses.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await db.raw(sql);
    
    console.log('✅ Migração 005 executada com sucesso!');
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('   - license_plans (planos de licença)');
    console.log('   - licenses (licenças por escola)');
    console.log('');
    console.log('📦 Planos criados:');
    console.log('   - Trial: 50 alunos, 5 professores, 10 turmas (Grátis)');
    console.log('   - Básico: 200 alunos, 20 professores, 20 turmas (€99.99/mês)');
    console.log('   - Premium: 500 alunos, 50 professores, 50 turmas (€249.99/mês)');
    console.log('   - Enterprise: Ilimitado (€999.99/mês)');
    console.log('');
    
    // Verificar licenças criadas
    const licenses = await db('licenses as l')
      .join('schools as s', 'l.school_id', 's.id')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select('s.name as school_name', 'lp.display_name as plan_name', 'l.status', 'l.trial_ends_at')
      .orderBy('s.name');
    
    if (licenses.length > 0) {
      console.log('🏫 Licenças atribuídas automaticamente:');
      licenses.forEach(lic => {
        const expiryDate = lic.trial_ends_at ? new Date(lic.trial_ends_at).toLocaleDateString() : 'N/A';
        console.log(`   - ${lic.school_name}: ${lic.plan_name} (${lic.status}) - Expira: ${expiryDate}`);
      });
      console.log('');
    }
    
    console.log('🎉 Sistema de licenças pronto para usar!');
    console.log('');
    console.log('📖 Próximos passos:');
    console.log('   1. Reiniciar o backend (npm run dev)');
    console.log('   2. Login como admin');
    console.log('   3. Acessar /admin para ver painel de administração');
    console.log('   4. Acessar /licencas para gerir licenças');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    if (error.message.includes('already exists')) {
      console.log('');
      console.log('ℹ️  As tabelas já existem. Migração já foi executada anteriormente.');
    } else {
      process.exit(1);
    }
  } finally {
    await db.destroy();
  }
}

runMigration();
