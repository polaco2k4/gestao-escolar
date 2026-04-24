// Script para associar usuário admin a uma escola
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gestao_escolar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function fixUserSchool() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando escolas...\n');
    
    // Ver escolas existentes
    const schoolsResult = await client.query('SELECT id, name FROM schools LIMIT 5');
    
    if (schoolsResult.rows.length === 0) {
      console.log('❌ Nenhuma escola encontrada. Criando escola padrão...\n');
      
      // Criar escola padrão
      const newSchool = await client.query(`
        INSERT INTO schools (name, address, phone, email, active)
        VALUES ('Escola Principal', 'Luanda, Angola', '+244 900 000 000', 'escola@exemplo.ao', true)
        RETURNING id, name
      `);
      
      console.log('✅ Escola criada:', newSchool.rows[0].name);
      console.log('   ID:', newSchool.rows[0].id, '\n');
      
      const schoolId = newSchool.rows[0].id;
      
      // Associar usuário admin à escola
      await client.query(`
        UPDATE users 
        SET school_id = $1
        WHERE email = 'admin@escola.ao'
      `, [schoolId]);
      
      console.log('✅ Usuário admin@escola.ao associado à escola!\n');
      
    } else {
      console.log('✅ Escolas encontradas:');
      schoolsResult.rows.forEach((school, index) => {
        console.log(`   ${index + 1}. ${school.name} (${school.id})`);
      });
      
      const schoolId = schoolsResult.rows[0].id;
      console.log(`\n📌 Usando primeira escola: ${schoolsResult.rows[0].name}\n`);
      
      // Associar usuário admin à primeira escola
      await client.query(`
        UPDATE users 
        SET school_id = $1
        WHERE email = 'admin@escola.ao'
      `, [schoolId]);
      
      console.log('✅ Usuário admin@escola.ao associado à escola!\n');
    }
    
    // Verificar resultado
    const userResult = await client.query(`
      SELECT u.id, u.email, u.school_id, s.name as school_name
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.email = 'admin@escola.ao'
    `);
    
    console.log('📊 Resultado final:');
    console.log('   Email:', userResult.rows[0].email);
    console.log('   School ID:', userResult.rows[0].school_id);
    console.log('   Escola:', userResult.rows[0].school_name);
    
    console.log('\n🎉 Correção concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Faça LOGOUT no sistema');
    console.log('   2. Faça LOGIN novamente');
    console.log('   3. O school_id será salvo automaticamente');
    console.log('   4. Tente criar uma sala\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserSchool();
