const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TOKEN = process.env.AUTH_TOKEN || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testAssiduidadeCRUD() {
  console.log('\n🧪 Testando CRUD de Assiduidade...\n');

  try {
    // 1. CREATE - Registar presença
    console.log('1️⃣ CREATE - Registar presença...');
    const createResponse = await api.post('/assiduidade', {
      student_id: 'test-student-id',
      schedule_id: 'test-schedule-id',
      date: '2024-04-24',
      status: 'present',
      school_id: 'test-school-id'
    });
    console.log('✅ Presença registada:', createResponse.data.data.id);
    const attendanceId = createResponse.data.data.id;

    // 2. READ - Listar presenças
    console.log('\n2️⃣ READ - Listar presenças...');
    const listResponse = await api.get('/assiduidade?page=1&limit=10');
    console.log(`✅ ${listResponse.data.data.records.length} registos encontrados`);

    // 3. READ - Obter por ID
    console.log('\n3️⃣ READ - Obter presença por ID...');
    const getResponse = await api.get(`/assiduidade/${attendanceId}`);
    console.log('✅ Presença obtida:', getResponse.data.data.status);

    // 4. UPDATE - Atualizar presença
    console.log('\n4️⃣ UPDATE - Atualizar presença...');
    const updateResponse = await api.put(`/assiduidade/${attendanceId}`, {
      status: 'late',
      notes: 'Chegou 10 minutos atrasado'
    });
    console.log('✅ Presença atualizada:', updateResponse.data.data.status);

    // 5. Registar em lote
    console.log('\n5️⃣ CREATE BULK - Registar presenças em lote...');
    const bulkResponse = await api.post('/assiduidade/bulk', {
      records: [
        {
          student_id: 'test-student-1',
          schedule_id: 'test-schedule-id',
          date: '2024-04-24',
          status: 'present',
          recorded_by: 'test-teacher-id',
          school_id: 'test-school-id'
        },
        {
          student_id: 'test-student-2',
          schedule_id: 'test-schedule-id',
          date: '2024-04-24',
          status: 'absent',
          recorded_by: 'test-teacher-id',
          school_id: 'test-school-id'
        }
      ]
    });
    console.log(`✅ ${bulkResponse.data.data.length} presenças registadas em lote`);

    // 6. Sumário de estudante
    console.log('\n6️⃣ READ - Sumário de estudante...');
    const summaryResponse = await api.get('/assiduidade/summary/student/test-student-id');
    console.log('✅ Sumário:', summaryResponse.data.data);

    // 7. DELETE - Eliminar presença
    console.log('\n7️⃣ DELETE - Eliminar presença...');
    const deleteResponse = await api.delete(`/assiduidade/${attendanceId}`);
    console.log('✅ Presença eliminada:', deleteResponse.data.message);

    console.log('\n✅ Todos os testes de Assiduidade passaram!\n');
  } catch (error) {
    console.error('❌ Erro nos testes de Assiduidade:', error.response?.data || error.message);
  }
}

async function testJustificationsCRUD() {
  console.log('\n🧪 Testando CRUD de Justificações...\n');

  try {
    // 1. CREATE - Submeter justificação
    console.log('1️⃣ CREATE - Submeter justificação...');
    const createResponse = await api.post('/assiduidade/justifications', {
      attendance_id: 'test-attendance-id',
      reason: 'Consulta médica',
      supporting_document: 'atestado.pdf',
      school_id: 'test-school-id'
    });
    console.log('✅ Justificação submetida:', createResponse.data.data.id);
    const justificationId = createResponse.data.data.id;

    // 2. READ - Listar justificações
    console.log('\n2️⃣ READ - Listar justificações...');
    const listResponse = await api.get('/assiduidade/justifications?status=pending');
    console.log(`✅ ${listResponse.data.data.length} justificações encontradas`);

    // 3. UPDATE - Rever justificação
    console.log('\n3️⃣ UPDATE - Aprovar justificação...');
    const reviewResponse = await api.put(`/assiduidade/justifications/${justificationId}/review`, {
      status: 'approved'
    });
    console.log('✅ Justificação aprovada:', reviewResponse.data.data.status);

    // 4. DELETE - Eliminar justificação
    console.log('\n4️⃣ DELETE - Eliminar justificação...');
    const deleteResponse = await api.delete(`/assiduidade/justifications/${justificationId}`);
    console.log('✅ Justificação eliminada:', deleteResponse.data.message);

    console.log('\n✅ Todos os testes de Justificações passaram!\n');
  } catch (error) {
    console.error('❌ Erro nos testes de Justificações:', error.response?.data || error.message);
  }
}

async function testDocumentosCRUD() {
  console.log('\n🧪 Testando CRUD de Documentos...\n');

  try {
    // 1. CREATE - Criar template
    console.log('1️⃣ CREATE - Criar template...');
    const createTemplateResponse = await api.post('/documentos/templates', {
      name: 'Declaração de Matrícula',
      type: 'enrollment_certificate',
      content_template: 'Declaramos que {{student_name}} está matriculado...',
      school_id: 'test-school-id',
      active: true
    });
    console.log('✅ Template criado:', createTemplateResponse.data.data.id);
    const templateId = createTemplateResponse.data.data.id;

    // 2. READ - Listar templates
    console.log('\n2️⃣ READ - Listar templates...');
    const listTemplatesResponse = await api.get('/documentos/templates');
    console.log(`✅ ${listTemplatesResponse.data.data.length} templates encontrados`);

    // 3. READ - Obter template por ID
    console.log('\n3️⃣ READ - Obter template por ID...');
    const getTemplateResponse = await api.get(`/documentos/templates/${templateId}`);
    console.log('✅ Template obtido:', getTemplateResponse.data.data.name);

    // 4. UPDATE - Atualizar template
    console.log('\n4️⃣ UPDATE - Atualizar template...');
    const updateTemplateResponse = await api.put(`/documentos/templates/${templateId}`, {
      name: 'Declaração de Matrícula Atualizada',
      active: true
    });
    console.log('✅ Template atualizado:', updateTemplateResponse.data.data.name);

    // 5. CREATE - Solicitar documento
    console.log('\n5️⃣ CREATE - Solicitar documento...');
    const createDocResponse = await api.post('/documentos', {
      type: 'certificate',
      template_id: templateId,
      student_id: 'test-student-id',
      notes: 'Urgente',
      school_id: 'test-school-id'
    });
    console.log('✅ Documento solicitado:', createDocResponse.data.data.id);
    const documentId = createDocResponse.data.data.id;

    // 6. READ - Listar documentos
    console.log('\n6️⃣ READ - Listar documentos...');
    const listDocsResponse = await api.get('/documentos?page=1&limit=10');
    console.log(`✅ ${listDocsResponse.data.data.documents.length} documentos encontrados`);

    // 7. READ - Obter documento por ID
    console.log('\n7️⃣ READ - Obter documento por ID...');
    const getDocResponse = await api.get(`/documentos/${documentId}`);
    console.log('✅ Documento obtido:', getDocResponse.data.data.type);

    // 8. UPDATE - Atualizar estado do documento
    console.log('\n8️⃣ UPDATE - Atualizar estado do documento...');
    const updateStatusResponse = await api.put(`/documentos/${documentId}/status`, {
      status: 'ready',
      notes: 'Documento pronto para levantamento'
    });
    console.log('✅ Estado atualizado:', updateStatusResponse.data.data.status);

    // 9. DELETE - Eliminar documento
    console.log('\n9️⃣ DELETE - Eliminar documento...');
    const deleteDocResponse = await api.delete(`/documentos/${documentId}`);
    console.log('✅ Documento eliminado:', deleteDocResponse.data.message);

    // 10. DELETE - Eliminar template
    console.log('\n🔟 DELETE - Eliminar template...');
    const deleteTemplateResponse = await api.delete(`/documentos/templates/${templateId}`);
    console.log('✅ Template eliminado:', deleteTemplateResponse.data.message);

    console.log('\n✅ Todos os testes de Documentos passaram!\n');
  } catch (error) {
    console.error('❌ Erro nos testes de Documentos:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes de CRUD...\n');
  console.log('Base URL:', BASE_URL);
  console.log('Token configurado:', TOKEN ? 'Sim' : 'Não');
  
  if (!TOKEN) {
    console.log('\n⚠️  AVISO: Token não configurado. Configure AUTH_TOKEN no ambiente.\n');
    console.log('Exemplo: export AUTH_TOKEN="seu-token-aqui"\n');
  }

  await testAssiduidadeCRUD();
  await testJustificationsCRUD();
  await testDocumentosCRUD();

  console.log('\n🎉 Todos os testes concluídos!\n');
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  testAssiduidadeCRUD,
  testJustificationsCRUD,
  testDocumentosCRUD
};
