import db from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function runSeed() {
  try {
    console.log('🌱 Iniciando seed de dados...');

    const seedFile = path.join(__dirname, '../database/seeds/003_seed_subjects_teachers_types.sql');
    const sql = fs.readFileSync(seedFile, 'utf8');

    await db.raw(sql);

    console.log('✅ Seed concluído com sucesso!');
    
    // Verificar dados inseridos
    const subjects = await db('subjects').count('* as count');
    const teachers = await db('teachers').count('* as count');
    const types = await db('assessment_types').count('* as count');

    console.log(`📚 Disciplinas: ${subjects[0].count}`);
    console.log(`👨‍🏫 Professores: ${teachers[0].count}`);
    console.log(`📝 Tipos de Avaliação: ${types[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

runSeed();
