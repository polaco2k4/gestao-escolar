const axios = require('axios');

const API_URL = 'http://localhost:5000';
let authToken = '';

async function testEndpoints() {
  try {
    console.log('🧪 A testar endpoints da API...\n');

    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health:', health.data);

    // 2. Login
    console.log('\n2️⃣ Testing Login...');
    const login = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@escola.ao',
      password: 'Admin@123'
    });
    console.log('Resposta completa:', JSON.stringify(login.data, null, 2));
    authToken = login.data.data?.access_token || login.data.access_token;
    console.log('✅ Login bem-sucedido');
    const userData = login.data.data?.user || login.data.user;
    if (userData) {
      console.log('👤 Utilizador:', userData.email);
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 3. Get Profile
    console.log('\n3️⃣ Testing Get Profile...');
    const profile = await axios.get(`${API_URL}/api/auth/me`, { headers });
    const profileData = profile.data.data || profile.data;
    console.log('✅ Perfil:', profileData.email, '-', profileData.role);

    // 4. Test Matrículas
    console.log('\n4️⃣ Testing Matrículas...');
    const matriculas = await axios.get(`${API_URL}/api/matriculas`, { headers });
    console.log('✅ Matrículas:', matriculas.data.total || 0, 'registos');

    // 5. Test Avaliações
    console.log('\n5️⃣ Testing Avaliações...');
    const avaliacoes = await axios.get(`${API_URL}/api/avaliacoes`, { headers });
    console.log('✅ Avaliações:', avaliacoes.data.total || 0, 'registos');

    // 6. Test Horários
    console.log('\n6️⃣ Testing Horários...');
    const horarios = await axios.get(`${API_URL}/api/horarios/schedules`, { headers });
    console.log('✅ Horários:', horarios.data.total || 0, 'registos');

    // 7. Test Financeiro
    console.log('\n7️⃣ Testing Financeiro...');
    const financeiro = await axios.get(`${API_URL}/api/financeiro/student-fees`, { headers });
    console.log('✅ Propinas:', financeiro.data.total || 0, 'registos');

    // 8. Test Comunicação
    console.log('\n8️⃣ Testing Comunicação...');
    const comunicacao = await axios.get(`${API_URL}/api/comunicacao/messages`, { headers });
    console.log('✅ Mensagens:', comunicacao.data.total || 0, 'registos');

    // 9. Test Assiduidade
    console.log('\n9️⃣ Testing Assiduidade...');
    const assiduidade = await axios.get(`${API_URL}/api/assiduidade`, { headers });
    console.log('✅ Presenças:', assiduidade.data.total || 0, 'registos');

    // 10. Test Documentos
    console.log('\n🔟 Testing Documentos...');
    const documentos = await axios.get(`${API_URL}/api/documentos`, { headers });
    console.log('✅ Documentos:', documentos.data.total || 0, 'registos');

    console.log('\n🎉 Todos os endpoints testados com sucesso!');
    console.log('✅ Sistema totalmente funcional');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data.message);
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

testEndpoints();
