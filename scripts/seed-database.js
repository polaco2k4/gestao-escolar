const knex = require('knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

async function seedDatabase() {
  try {
    console.log('🌱 A popular base de dados com dados de exemplo...\n');

    // 1. Criar escola
    console.log('1️⃣ A criar escola...');
    const [school] = await db('schools').insert({
      name: 'Escola Secundária de Luanda',
      code: 'ESL001',
      address: 'Rua Principal, Luanda',
      phone: '+244 923 456 789',
      email: 'geral@escolaluanda.ao'
    }).returning('*');
    console.log('✅ Escola criada:', school.name);

    // 2. Criar ano lectivo
    console.log('\n2️⃣ A criar ano lectivo...');
    const [academicYear] = await db('academic_years').insert({
      school_id: school.id,
      name: '2026/2027',
      start_date: '2026-09-01',
      end_date: '2027-07-31',
      is_current: true
    }).returning('*');
    console.log('✅ Ano lectivo criado:', academicYear.name);

    // 3. Criar curso
    console.log('\n3️⃣ A criar curso...');
    const [course] = await db('courses').insert({
      school_id: school.id,
      name: 'Ensino Secundário - Ciências',
      code: 'ESC',
      duration_years: 3
    }).returning('*');
    console.log('✅ Curso criado:', course.name);

    // 4. Criar disciplinas
    console.log('\n4️⃣ A criar disciplinas...');
    const subjects = await db('subjects').insert([
      { school_id: school.id, name: 'Matemática', code: 'MAT', course_id: course.id },
      { school_id: school.id, name: 'Física', code: 'FIS', course_id: course.id },
      { school_id: school.id, name: 'Química', code: 'QUI', course_id: course.id },
      { school_id: school.id, name: 'Biologia', code: 'BIO', course_id: course.id },
      { school_id: school.id, name: 'Português', code: 'POR', course_id: course.id },
      { school_id: school.id, name: 'Inglês', code: 'ING', course_id: course.id }
    ]).returning('*');
    console.log(`✅ ${subjects.length} disciplinas criadas`);

    // 5. Criar turma
    console.log('\n5️⃣ A criar turma...');
    const [classRoom] = await db('classes').insert({
      school_id: school.id,
      course_id: course.id,
      academic_year_id: academicYear.id,
      name: '10ª Classe A',
      code: '10A',
      capacity: 30
    }).returning('*');
    console.log('✅ Turma criada:', classRoom.name);

    // 6. Criar salas
    console.log('\n6️⃣ A criar salas...');
    const rooms = await db('rooms').insert([
      { school_id: school.id, name: 'Sala 101', code: 'S101', capacity: 35 },
      { school_id: school.id, name: 'Sala 102', code: 'S102', capacity: 35 },
      { school_id: school.id, name: 'Laboratório de Física', code: 'LAB1', capacity: 25 }
    ]).returning('*');
    console.log(`✅ ${rooms.length} salas criadas`);

    // 7. Criar professores
    console.log('\n7️⃣ A criar professores...');
    const passwordHash = await bcrypt.hash('Prof@123', 12);
    
    const teacherUsers = await db('users').insert([
      { email: 'prof.matematica@escola.ao', password_hash: passwordHash, first_name: 'João', last_name: 'Silva', role: 'teacher', school_id: school.id },
      { email: 'prof.fisica@escola.ao', password_hash: passwordHash, first_name: 'Maria', last_name: 'Santos', role: 'teacher', school_id: school.id },
      { email: 'prof.quimica@escola.ao', password_hash: passwordHash, first_name: 'Pedro', last_name: 'Costa', role: 'teacher', school_id: school.id }
    ]).returning('*');

    const teachers = await db('teachers').insert(
      teacherUsers.map(user => ({
        user_id: user.id,
        school_id: school.id,
        employee_number: `PROF${Math.floor(Math.random() * 1000)}`,
        hire_date: '2026-01-01'
      }))
    ).returning('*');
    console.log(`✅ ${teachers.length} professores criados`);

    // 8. Criar estudantes
    console.log('\n8️⃣ A criar estudantes...');
    const studentPasswordHash = await bcrypt.hash('Aluno@123', 12);
    
    const studentUsers = await db('users').insert([
      { email: 'aluno1@escola.ao', password_hash: studentPasswordHash, first_name: 'Carlos', last_name: 'Manuel', role: 'student', school_id: school.id },
      { email: 'aluno2@escola.ao', password_hash: studentPasswordHash, first_name: 'Ana', last_name: 'Fernandes', role: 'student', school_id: school.id },
      { email: 'aluno3@escola.ao', password_hash: studentPasswordHash, first_name: 'José', last_name: 'António', role: 'student', school_id: school.id },
      { email: 'aluno4@escola.ao', password_hash: studentPasswordHash, first_name: 'Beatriz', last_name: 'Sousa', role: 'student', school_id: school.id },
      { email: 'aluno5@escola.ao', password_hash: studentPasswordHash, first_name: 'Miguel', last_name: 'Pereira', role: 'student', school_id: school.id }
    ]).returning('*');

    const students = await db('students').insert(
      studentUsers.map((user, index) => ({
        user_id: user.id,
        school_id: school.id,
        student_number: `EST${2026}${String(index + 1).padStart(4, '0')}`,
        date_of_birth: '2010-01-01',
        gender: index % 2 === 0 ? 'M' : 'F'
      }))
    ).returning('*');
    console.log(`✅ ${students.length} estudantes criados`);

    // 9. Criar matrículas
    console.log('\n9️⃣ A criar matrículas...');
    const enrollments = await db('enrollments').insert(
      students.map(student => ({
        student_id: student.id,
        class_id: classRoom.id,
        academic_year_id: academicYear.id,
        enrollment_date: '2026-09-01',
        status: 'active'
      }))
    ).returning('*');
    console.log(`✅ ${enrollments.length} matrículas criadas`);

    // 10. Criar tipos de propinas
    console.log('\n🔟 A criar tipos de propinas...');
    const feeTypes = await db('fee_types').insert([
      { school_id: school.id, name: 'Matrícula', amount: 15000, frequency: 'once', academic_year_id: academicYear.id },
      { school_id: school.id, name: 'Mensalidade', amount: 25000, frequency: 'monthly', academic_year_id: academicYear.id },
      { school_id: school.id, name: 'Material Escolar', amount: 10000, frequency: 'once', academic_year_id: academicYear.id }
    ]).returning('*');
    console.log(`✅ ${feeTypes.length} tipos de propinas criados`);

    // 11. Criar propinas para estudantes
    console.log('\n1️⃣1️⃣ A criar propinas para estudantes...');
    const studentFees = [];
    for (const student of students) {
      for (const feeType of feeTypes) {
        studentFees.push({
          student_id: student.id,
          fee_type_id: feeType.id,
          academic_year_id: academicYear.id,
          amount: feeType.amount,
          due_date: '2026-09-30',
          status: 'pending'
        });
      }
    }
    await db('student_fees').insert(studentFees);
    console.log(`✅ ${studentFees.length} propinas criadas para estudantes`);

    console.log('\n🎉 Base de dados populada com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  - 1 Escola:', school.name);
    console.log('  - 1 Ano Lectivo:', academicYear.name);
    console.log('  - 1 Curso:', course.name);
    console.log('  - 6 Disciplinas');
    console.log('  - 1 Turma:', classRoom.name);
    console.log('  - 3 Salas');
    console.log('  - 3 Professores');
    console.log('  - 5 Estudantes');
    console.log('  - 5 Matrículas');
    console.log('  - 3 Tipos de Propinas');
    console.log('  - 15 Propinas de Estudantes');

    console.log('\n🔐 Credenciais de Teste:');
    console.log('\n👨‍💼 Admin:');
    console.log('  Email: admin@escola.ao');
    console.log('  Password: Admin@123');
    console.log('\n👨‍🏫 Professor:');
    console.log('  Email: prof.matematica@escola.ao');
    console.log('  Password: Prof@123');
    console.log('\n👨‍🎓 Estudante:');
    console.log('  Email: aluno1@escola.ao');
    console.log('  Password: Aluno@123');

  } catch (error) {
    console.error('❌ Erro ao popular base de dados:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedDatabase();
