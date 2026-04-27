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

async function fixUsersWithoutSchool() {
  try {
    console.log('🔍 A procurar usuários sem escola...');
    
    // Buscar usuários sem school_id
    const usersWithoutSchool = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role')
      .whereNull('school_id');
    
    if (usersWithoutSchool.length === 0) {
      console.log('✅ Todos os usuários já têm escola atribuída!');
      return;
    }
    
    console.log(`📋 Encontrados ${usersWithoutSchool.length} usuários sem escola:`);
    usersWithoutSchool.forEach(u => {
      console.log(`   - ${u.first_name} ${u.last_name} (${u.email}) - ${u.role}`);
    });
    
    // Buscar primeira escola disponível
    const firstSchool = await db('schools')
      .select('id', 'name')
      .first();
    
    if (!firstSchool) {
      console.error('❌ Nenhuma escola encontrada no sistema!');
      process.exit(1);
    }
    
    console.log(`\n🏫 Atribuindo escola: ${firstSchool.name}`);
    
    // Atualizar usuários
    const updated = await db('users')
      .whereNull('school_id')
      .update({
        school_id: firstSchool.id,
        updated_at: new Date()
      });
    
    console.log(`✅ ${updated} usuários atualizados com sucesso!`);
    console.log(`\n📊 Todos os usuários agora pertencem a: ${firstSchool.name}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

fixUsersWithoutSchool();
