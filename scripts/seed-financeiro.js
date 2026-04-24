const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function seedFinanceiro() {
  try {
    console.log('🌱 A criar dados financeiros...\n');

    // 1. Login como admin
    console.log('1️⃣ Fazendo login como admin...');
    const login = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@escola.ao',
      password: 'Admin@123'
    });
    const authToken = login.data.data.access_token;
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Login efectuado\n');

    // 2. Obter escola
    console.log('2️⃣ A obter escola...');
    const schoolsRes = await axios.get(`${API_URL}/api/schools`, { headers });
    const schools = schoolsRes.data.data.schools || schoolsRes.data.data;
    
    if (!schools || schools.length === 0) {
      console.error('❌ Nenhuma escola encontrada.');
      process.exit(1);
    }
    
    const schoolId = schools[0].id;
    console.log('✅ Escola encontrada:', schools[0].name, '\n');

    // 3. Obter estudantes e matrículas
    console.log('3️⃣ A obter estudantes e matrículas...');
    const studentsRes = await axios.get(`${API_URL}/api/students`, { headers });
    let students = studentsRes.data.data.students || studentsRes.data.data;
    
    // Se ainda não for array, tentar outra estrutura
    if (!Array.isArray(students)) {
      students = studentsRes.data.data;
    }
    
    if (!students || students.length === 0) {
      console.error('❌ Nenhum estudante encontrado. Execute o seed principal primeiro.');
      console.error('Resposta da API:', JSON.stringify(studentsRes.data, null, 2));
      process.exit(1);
    }
    
    // Obter matrículas para pegar academic_year_id
    const matriculasRes = await axios.get(`${API_URL}/api/matriculas`, { headers });
    let matriculas = matriculasRes.data.data.enrollments || matriculasRes.data.data.matriculas || matriculasRes.data.data;
    if (!Array.isArray(matriculas)) matriculas = matriculasRes.data.data;
    
    // Criar mapa de student_id -> academic_year_id
    const studentAcademicYearMap = {};
    if (Array.isArray(matriculas)) {
      for (const matricula of matriculas) {
        studentAcademicYearMap[matricula.student_id] = matricula.academic_year_id;
      }
    } else {
      console.error('❌ Matrículas não é um array:', typeof matriculas);
      console.error('Resposta da API:', JSON.stringify(matriculasRes.data, null, 2));
      process.exit(1);
    }
    
    console.log(`✅ ${students.length} estudantes encontrados\n`);

    // 4. Criar tipos de propina se não existirem
    console.log('4️⃣ A criar tipos de propina...');
    const feeTypes = [
      { school_id: schoolId, name: 'Matrícula', amount: 15000, frequency: 'once', description: 'Taxa de matrícula anual' },
      { school_id: schoolId, name: 'Mensalidade', amount: 25000, frequency: 'monthly', description: 'Mensalidade mensal' },
      { school_id: schoolId, name: 'Material Escolar', amount: 10000, frequency: 'once', description: 'Taxa de material escolar' }
    ];

    const createdFeeTypes = [];
    for (const feeType of feeTypes) {
      try {
        const res = await axios.post(`${API_URL}/api/financeiro/fee-types`, feeType, { headers });
        createdFeeTypes.push(res.data.data);
        console.log('  ✅', feeType.name, '-', feeType.amount, 'Kz');
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log('  ⚠️', feeType.name, '- Já existe');
        } else {
          throw error;
        }
      }
    }

    // 5. Criar propinas para estudantes
    console.log('\n5️⃣ A criar propinas para estudantes...');
    const currentYear = new Date().getFullYear();
    let createdCount = 0;
    for (const student of students.slice(0, 5)) {
      for (const feeType of createdFeeTypes) {
        const dueDate = new Date(currentYear, 0, 15); // 15 de Janeiro
        const academicYearId = studentAcademicYearMap[student.id];
        
        if (!academicYearId) {
          console.warn('  ⚠️ Estudante sem matrícula:', student.first_name, student.last_name);
          continue;
        }
        
        const feeData = {
          student_id: student.id,
          fee_type_id: feeType.id,
          academic_year_id: academicYearId,
          amount: feeType.amount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending'
        };

        try {
          await axios.post(`${API_URL}/api/financeiro/student-fees`, feeData, { headers });
          createdCount++;
        } catch (error) {
          console.error('  ❌ Erro ao criar propina:', error.response?.data || error.message);
        }
      }
    }
    console.log(`✅ ${createdCount} propinas criadas\n`);

    // 6. Criar alguns pagamentos
    console.log('6️⃣ A criar pagamentos de exemplo...');
    const studentFeesRes = await axios.get(`${API_URL}/api/financeiro/student-fees`, { headers });
    let studentFees = studentFeesRes.data.data.fees || studentFeesRes.data.data;
    
    // Se ainda não for array, tentar outra estrutura
    if (!Array.isArray(studentFees)) {
      studentFees = studentFeesRes.data.data;
    }
    
    console.log(`✅ ${studentFees.length} propinas encontradas\n`);
    
    if (studentFees && Array.isArray(studentFees) && studentFees.length > 0) {
      let paymentCount = 0;
      for (let i = 0; i < Math.min(5, studentFees.length); i++) {
        const paymentData = {
          school_id: schoolId,
          student_fee_id: studentFees[i].id,
          amount: studentFees[i].amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          notes: 'Pagamento de teste'
        };

        try {
          await axios.post(`${API_URL}/api/financeiro/payments`, paymentData, { headers });
          paymentCount++;
          console.log('  ✅ Pagamento criado -', paymentData.amount, 'Kz');
        } catch (error) {
          console.error('  ❌ Erro ao criar pagamento:', error.response?.data || error.message);
        }
      }
      console.log(`✅ ${paymentCount} pagamentos criados\n`);
    } else {
      console.log('⚠️ Nenhuma propina encontrada para criar pagamentos\n');
    }

    console.log('\n🎉 Dados financeiros criados com sucesso!');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

seedFinanceiro();
