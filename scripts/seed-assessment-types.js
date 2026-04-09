const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function seedAssessmentTypes() {
  try {
    console.log('🌱 A criar tipos de avaliação...\n');

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
      console.error('❌ Nenhuma escola encontrada. Execute o seed principal primeiro.');
      console.error('Resposta da API:', JSON.stringify(schoolsRes.data, null, 2));
      process.exit(1);
    }
    
    const schoolId = schools[0].id;
    console.log('✅ Escola encontrada:', schools[0].name, '\n');

    // 3. Criar tipos de avaliação
    console.log('3️⃣ A criar tipos de avaliação...');
    const assessmentTypes = [
      { school_id: schoolId, name: 'Teste', weight: 0.3, max_score: 20 },
      { school_id: schoolId, name: 'Exame', weight: 0.4, max_score: 20 },
      { school_id: schoolId, name: 'Trabalho', weight: 0.2, max_score: 20 },
      { school_id: schoolId, name: 'Participação', weight: 0.1, max_score: 20 }
    ];

    for (const type of assessmentTypes) {
      try {
        await axios.post(`${API_URL}/api/assessment-types`, type, { headers });
        console.log('  ✅', type.name, '- Peso:', type.weight, '- Nota Máxima:', type.max_score);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log('  ⚠️', type.name, '- Já existe');
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 Tipos de avaliação criados com sucesso!');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

seedAssessmentTypes();
