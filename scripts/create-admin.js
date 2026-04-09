const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function createAdmin() {
  try {
    console.log('🔄 A criar utilizador admin...');
    
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: 'admin@escola.ao',
      password: 'Admin@123',
      first_name: 'Admin',
      last_name: 'Sistema',
      role: 'admin'
    });

    console.log('✅ Utilizador admin criado com sucesso!');
    console.log('📧 Email:', response.data.user.email);
    console.log('👤 Nome:', response.data.user.first_name, response.data.user.last_name);
    console.log('🔑 Token:', response.data.token.substring(0, 50) + '...');
    
    console.log('\n📝 Credenciais de Login:');
    console.log('Email: admin@escola.ao');
    console.log('Password: Admin@123');
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro:', error.response.data.message);
    } else {
      console.error('❌ Erro ao criar admin:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
