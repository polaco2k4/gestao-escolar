const fs = require('fs');
const path = require('path');

/**
 * Script para aplicar segregação de escola em todos os serviços
 * Este script adiciona os imports necessários e atualiza as assinaturas dos métodos
 */

const servicesToUpdate = [
  'classes',
  'courses',
  'subjects',
  'guardians',
  'matriculas',
  'avaliacoes',
  'assiduidade',
  'horarios',
  'financeiro',
  'documentos',
  'relatorios',
  'comunicacao'
];

const importsToAdd = `import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';`;

function updateServiceFile(serviceName) {
  const servicePath = path.join(__dirname, `../src/modules/${serviceName}/${serviceName}.service.ts`);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${servicePath}`);
    return false;
  }

  let content = fs.readFileSync(servicePath, 'utf-8');
  
  // Verificar se já foi atualizado
  if (content.includes('applySchoolFilter')) {
    console.log(`✅ ${serviceName}.service.ts já foi atualizado`);
    return true;
  }

  // Adicionar imports após os imports existentes
  const importRegex = /(import.*from.*;\n)+/;
  content = content.replace(importRegex, (match) => {
    return match + importsToAdd + '\n';
  });

  // Criar backup
  fs.writeFileSync(servicePath + '.backup', fs.readFileSync(servicePath));

  // Salvar arquivo atualizado
  fs.writeFileSync(servicePath, content);
  
  console.log(`📝 ${serviceName}.service.ts - imports adicionados (backup criado)`);
  console.log(`   ⚠️  ATENÇÃO: Você precisa atualizar manualmente:`);
  console.log(`      1. Adicionar parâmetro 'user?: AuthPayload' nos métodos`);
  console.log(`      2. Aplicar 'applySchoolFilter(query, user)' nas queries`);
  console.log(`      3. Usar 'canAccessSchool(user, school_id)' para validação`);
  console.log('');
  
  return true;
}

function updateControllerFile(serviceName) {
  const controllerPath = path.join(__dirname, `../src/modules/${serviceName}/${serviceName}.controller.ts`);
  
  if (!fs.existsSync(controllerPath)) {
    console.log(`⚠️  Controller não encontrado: ${controllerPath}`);
    return false;
  }

  let content = fs.readFileSync(controllerPath, 'utf-8');
  
  // Verificar se já foi atualizado
  if (content.includes('req.user)')) {
    console.log(`✅ ${serviceName}.controller.ts já foi atualizado`);
    return true;
  }

  console.log(`📝 ${serviceName}.controller.ts precisa ser atualizado manualmente`);
  console.log(`   Adicione 'req.user' como último parâmetro nas chamadas ao service`);
  console.log('');
  
  return true;
}

console.log('🚀 Iniciando aplicação de segregação de escola...\n');

servicesToUpdate.forEach(serviceName => {
  console.log(`\n📦 Processando: ${serviceName}`);
  console.log('─'.repeat(50));
  updateServiceFile(serviceName);
  updateControllerFile(serviceName);
});

console.log('\n' + '='.repeat(50));
console.log('✅ Script concluído!');
console.log('\n📋 Próximos passos MANUAIS para cada serviço:');
console.log('');
console.log('1. Abrir o arquivo .service.ts');
console.log('2. Atualizar assinaturas dos métodos:');
console.log('   async list(user?: AuthPayload) { ... }');
console.log('   async getById(id: string, user?: AuthPayload) { ... }');
console.log('   async create(data: any, user?: AuthPayload) { ... }');
console.log('   async update(id: string, data: any, user?: AuthPayload) { ... }');
console.log('');
console.log('3. Aplicar filtros nas queries:');
console.log('   let query = db("table");');
console.log('   query = applySchoolFilter(query, user);');
console.log('');
console.log('4. Validar acesso em getById/update/delete:');
console.log('   if (user && !canAccessSchool(user, resource.school_id)) {');
console.log('     throw new AppError("Sem permissão", 403);');
console.log('   }');
console.log('');
console.log('5. Atualizar controller para passar req.user');
console.log('');
console.log('📖 Consulte SEGREGACAO_ESCOLA_IMPLEMENTACAO.md para exemplos completos');
console.log('='.repeat(50));
