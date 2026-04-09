const axios = require('axios');

const API_URL = 'http://localhost:5000';
let authToken = '';

async function seedData() {
  try {
    console.log('🌱 A popular base de dados com dados de exemplo...\n');

    // 1. Login como admin
    console.log('1️⃣ Fazendo login como admin...');
    const login = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@escola.ao',
      password: 'Admin@123'
    });
    authToken = login.data.data.access_token;
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Login efectuado\n');

    // 2. Criar escola
    console.log('2️⃣ A criar escola...');
    const schoolData = {
      name: 'Escola Secundária de Luanda',
      code: 'ESL001',
      address: 'Rua Principal, Luanda',
      phone: '+244 923 456 789',
      email: 'geral@escolaluanda.ao'
    };
    
    const schoolRes = await axios.post(`${API_URL}/api/matriculas/schools`, schoolData, { headers });
    const schoolId = schoolRes.data.data.id;
    console.log('✅ Escola criada:', schoolRes.data.data.name);

    // 3. Criar ano lectivo
    console.log('\n3️⃣ A criar ano lectivo...');
    const yearData = {
      school_id: schoolId,
      name: '2026/2027',
      start_date: '2026-09-01',
      end_date: '2027-07-31',
      is_current: true
    };
    
    const yearRes = await axios.post(`${API_URL}/api/matriculas/academic-years`, yearData, { headers });
    const yearId = yearRes.data.data.id;
    console.log('✅ Ano lectivo criado:', yearRes.data.data.name);

    // 4. Criar curso
    console.log('\n4️⃣ A criar curso...');
    const courseData = {
      school_id: schoolId,
      name: 'Ensino Secundário - Ciências',
      code: 'ESC',
      duration_years: 3
    };
    
    const courseRes = await axios.post(`${API_URL}/api/horarios/courses`, courseData, { headers });
    const courseId = courseRes.data.data.id;
    console.log('✅ Curso criado:', courseRes.data.data.name);

    // 5. Criar disciplinas
    console.log('\n5️⃣ A criar disciplinas...');
    const subjects = [
      { name: 'Matemática', code: 'MAT', course_id: courseId },
      { name: 'Física', code: 'FIS', course_id: courseId },
      { name: 'Química', code: 'QUI', course_id: courseId },
      { name: 'Biologia', code: 'BIO', course_id: courseId },
      { name: 'Português', code: 'POR', course_id: courseId },
      { name: 'Inglês', code: 'ING', course_id: courseId }
    ];

    const subjectIds = [];
    for (const subject of subjects) {
      const res = await axios.post(`${API_URL}/api/horarios/subjects`, subject, { headers });
      subjectIds.push(res.data.data.id);
      console.log('  ✅', subject.name);
    }

    // 6. Criar turma
    console.log('\n6️⃣ A criar turma...');
    const classData = {
      school_id: schoolId,
      course_id: courseId,
      academic_year_id: yearId,
      name: '10ª Classe A',
      code: '10A',
      capacity: 30
    };
    
    const classRes = await axios.post(`${API_URL}/api/horarios/classes`, classData, { headers });
    const classId = classRes.data.data.id;
    console.log('✅ Turma criada:', classRes.data.data.name);

    // 7. Criar professores
    console.log('\n7️⃣ A criar professores...');
    const teachers = [
      { email: 'prof.matematica@escola.ao', password: 'Prof@123', first_name: 'João', last_name: 'Silva', role: 'teacher', school_id: schoolId },
      { email: 'prof.fisica@escola.ao', password: 'Prof@123', first_name: 'Maria', last_name: 'Santos', role: 'teacher', school_id: schoolId },
      { email: 'prof.quimica@escola.ao', password: 'Prof@123', first_name: 'Pedro', last_name: 'Costa', role: 'teacher', school_id: schoolId }
    ];

    const teacherIds = [];
    for (const teacher of teachers) {
      const res = await axios.post(`${API_URL}/api/auth/register`, teacher);
      teacherIds.push(res.data.data.user.id);
      console.log('  ✅', teacher.first_name, teacher.last_name);
    }

    // 8. Criar estudantes
    console.log('\n8️⃣ A criar estudantes...');
    const students = [
      { email: 'aluno1@escola.ao', password: 'Aluno@123', first_name: 'Carlos', last_name: 'Manuel', role: 'student', school_id: schoolId },
      { email: 'aluno2@escola.ao', password: 'Aluno@123', first_name: 'Ana', last_name: 'Fernandes', role: 'student', school_id: schoolId },
      { email: 'aluno3@escola.ao', password: 'Aluno@123', first_name: 'José', last_name: 'António', role: 'student', school_id: schoolId },
      { email: 'aluno4@escola.ao', password: 'Aluno@123', first_name: 'Beatriz', last_name: 'Sousa', role: 'student', school_id: schoolId },
      { email: 'aluno5@escola.ao', password: 'Aluno@123', first_name: 'Miguel', last_name: 'Pereira', role: 'student', school_id: schoolId }
    ];

    const studentIds = [];
    for (const student of students) {
      const res = await axios.post(`${API_URL}/api/auth/register`, student);
      studentIds.push(res.data.data.user.id);
      console.log('  ✅', student.first_name, student.last_name);
    }

    // 9. Criar matrículas
    console.log('\n9️⃣ A criar matrículas...');
    for (const studentId of studentIds) {
      const enrollmentData = {
        student_id: studentId,
        class_id: classId,
        academic_year_id: yearId,
        enrollment_date: '2026-09-01',
        status: 'active'
      };
      await axios.post(`${API_URL}/api/matriculas`, enrollmentData, { headers });
    }
    console.log(`✅ ${studentIds.length} matrículas criadas`);

    // 10. Criar tipos de avaliação
    console.log('\n🔟 A criar tipos de avaliação...');
    const assessmentTypes = [
      { school_id: schoolId, name: 'Teste', weight: 0.3, max_score: 20 },
      { school_id: schoolId, name: 'Exame', weight: 0.4, max_score: 20 },
      { school_id: schoolId, name: 'Trabalho', weight: 0.2, max_score: 20 },
      { school_id: schoolId, name: 'Participação', weight: 0.1, max_score: 20 }
    ];

    for (const type of assessmentTypes) {
      await axios.post(`${API_URL}/api/assessment-types`, type, { headers });
      console.log('  ✅', type.name, '- Peso:', type.weight, '- Nota Máxima:', type.max_score);
    }

    // 11. Criar tipos de propinas
    console.log('\n1️⃣1️⃣ A criar tipos de propinas...');
    const feeTypes = [
      { school_id: schoolId, name: 'Matrícula', amount: 15000, frequency: 'once' },
      { school_id: schoolId, name: 'Mensalidade', amount: 25000, frequency: 'monthly' },
      { school_id: schoolId, name: 'Material Escolar', amount: 10000, frequency: 'once' }
    ];

    for (const feeType of feeTypes) {
      await axios.post(`${API_URL}/api/financeiro/fee-types`, feeType, { headers });
      console.log('  ✅', feeType.name, '-', feeType.amount, 'Kz');
    }

    console.log('\n🎉 Base de dados populada com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  - 1 Escola');
    console.log('  - 1 Ano Lectivo');
    console.log('  - 1 Curso');
    console.log('  - 6 Disciplinas');
    console.log('  - 1 Turma');
    console.log('  - 3 Professores');
    console.log('  - 5 Estudantes');
    console.log('  - 5 Matrículas');
    console.log('  - 4 Tipos de Avaliação');
    console.log('  - 3 Tipos de Propinas');

    console.log('\n🔐 Credenciais de Teste:');
    console.log('\nAdmin:');
    console.log('  Email: admin@escola.ao');
    console.log('  Password: Admin@123');
    console.log('\nProfessor:');
    console.log('  Email: prof.matematica@escola.ao');
    console.log('  Password: Prof@123');
    console.log('\nEstudante:');
    console.log('  Email: aluno1@escola.ao');
    console.log('  Password: Aluno@123');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

seedData();
