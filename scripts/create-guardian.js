const knex = require('knex');
const bcrypt = require('bcryptjs');
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

async function createGuardian() {
  try {
    const args = process.argv.slice(2);
    
    // Se foram passados argumentos, criar novo utilizador
    if (args.length >= 4) {
      const [email, password, first_name, last_name, phone] = args;
      
      console.log('👤 A criar novo utilizador encarregado...\n');
      
      // Verificar se email já existe
      const existing = await db('users').where({ email }).first();
      if (existing) {
        console.log('❌ Email já registado:', email);
        process.exit(1);
      }
      
      // Buscar primeira escola
      const school = await db('schools').first();
      if (!school) {
        console.log('❌ Nenhuma escola encontrada. Crie uma escola primeiro.');
        process.exit(1);
      }
      
      // Criar password hash
      const password_hash = await bcrypt.hash(password, 12);
      
      // Criar utilizador
      const [user] = await db('users')
        .insert({
          email,
          password_hash,
          first_name,
          last_name,
          role: 'encarregado',
          phone: phone || null,
          school_id: school.id,
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'school_id']);
      
      console.log('✅ Utilizador criado:', user.email);
      
      // Criar registro na tabela guardians
      await db('guardians').insert({
        user_id: user.id,
        school_id: school.id,
        occupation: 'Não especificado',
        address: 'Não especificado',
        relationship: 'Pai/Mãe',
      });
      
      console.log('✅ Registro guardian criado com sucesso!\n');
      console.log('📊 Resumo:');
      console.log('  Email:', user.email);
      console.log('  Nome:', user.first_name, user.last_name);
      console.log('  Password:', password);
      console.log('  Escola:', school.name);
      
      process.exit(0);
    }
    
    // Se não foram passados argumentos, listar encarregados existentes
    console.log('🔍 A buscar utilizadores do tipo encarregado...\n');
    
    const guardians = await db('users')
      .where({ role: 'encarregado' })
      .select('id', 'email', 'first_name', 'last_name', 'school_id');
    
    if (guardians.length === 0) {
      console.log('❌ Nenhum encarregado encontrado.');
      console.log('� Para criar um novo encarregado, execute:');
      console.log('   node scripts/create-guardian.js <email> <password> <nome> <apelido> [telefone]\n');
      console.log('   Exemplo:');
      console.log('   node scripts/create-guardian.js encarregado@escola.ao Encarregado@123 João Santos\n');
      process.exit(1);
    }
    
    console.log('📋 Encarregados encontrados:\n');
    guardians.forEach((g, i) => {
      console.log(`${i + 1}. ${g.first_name} ${g.last_name} (${g.email})`);
      console.log(`   ID: ${g.id}`);
      console.log(`   School ID: ${g.school_id || 'Não definido'}\n`);
    });
    
    // Listar escolas
    console.log('🏫 A buscar escolas...\n');
    const schools = await db('schools')
      .select('id', 'name', 'code');
    
    if (schools.length === 0) {
      console.log('❌ Nenhuma escola encontrada.');
      process.exit(1);
    }
    
    console.log('📋 Escolas disponíveis:\n');
    schools.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} (${s.code})`);
      console.log(`   ID: ${s.id}\n`);
    });
    
    // Para cada encarregado, criar registro na tabela guardians se ainda não existir
    for (const guardian of guardians) {
      const existing = await db('guardians')
        .where({ user_id: guardian.id })
        .first();
      
      if (existing) {
        console.log(`⚠️  Registro guardian já existe para ${guardian.email}`);
        continue;
      }
      
      // Usar o school_id do utilizador ou a primeira escola se não tiver
      const schoolId = guardian.school_id || schools[0].id;
      
      await db('guardians').insert({
        user_id: guardian.id,
        school_id: schoolId,
        occupation: 'Não especificado',
        address: 'Não especificado',
        relationship: 'Pai/Mãe'
      });
      
      console.log(`✅ Registro guardian criado para ${guardian.email}`);
    }
    
    console.log('\n🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

createGuardian();
