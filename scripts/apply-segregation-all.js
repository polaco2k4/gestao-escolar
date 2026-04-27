const fs = require('fs');
const path = require('path');

/**
 * Script para aplicar segregação de escola em todos os serviços restantes
 * Aplica automaticamente os imports e atualiza assinaturas de métodos
 */

const SERVICES_TO_UPDATE = [
  'assiduidade',
  'financeiro',
  'horarios',
  'documentos',
  'relatorios',
  'comunicacao'
];

const IMPORTS_TO_ADD = `import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';`;

// Padrões de código para substituir
const PATTERNS = {
  // Service patterns
  listMethod: {
    old: /async list\((.*?)\) \{/g,
    new: 'async list($1, user?: AuthPayload) {'
  },
  getByIdMethod: {
    old: /async getById\(id: string\) \{/g,
    new: 'async getById(id: string, user?: AuthPayload) {'
  },
  createMethod: {
    old: /async create\((.*?)\) \{/g,
    new: 'async create($1, user?: AuthPayload) {'
  },
  updateMethod: {
    old: /async update\(id: string, (.*?)\) \{/g,
    new: 'async update(id: string, $1, user?: AuthPayload) {'
  },
  deleteMethod: {
    old: /async delete\(id: string\) \{/g,
    new: 'async delete(id: string, user?: AuthPayload) {'
  },
  
  // Controller patterns
  serviceListCall: {
    old: /await service\.list\((.*?)\);/g,
    new: 'await service.list($1, req.user);'
  },
  serviceGetByIdCall: {
    old: /await service\.getById\(req\.params\.id\);/g,
    new: 'await service.getById(req.params.id, req.user);'
  },
  serviceCreateCall: {
    old: /await service\.create\(req\.body\);/g,
    new: 'await service.create(req.body, req.user);'
  },
  serviceUpdateCall: {
    old: /await service\.update\(req\.params\.id, req\.body\);/g,
    new: 'await service.update(req.params.id, req.body, req.user);'
  },
  serviceDeleteCall: {
    old: /await service\.delete\(req\.params\.id\);/g,
    new: 'await service.delete(req.params.id, req.user);'
  }
};

function addImportsToService(content) {
  // Verificar se já tem os imports
  if (content.includes('applySchoolFilter')) {
    return content;
  }

  // Encontrar a última linha de import
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ') && !importLines[i].includes('from \'./')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    // Se não encontrou imports, adicionar no início
    return IMPORTS_TO_ADD + '\n' + content;
  }

  // Adicionar após o último import
  importLines.splice(lastImportIndex + 1, 0, IMPORTS_TO_ADD);
  return importLines.join('\n');
}

function updateServiceFile(serviceName) {
  const servicePath = path.join(__dirname, `../src/modules/${serviceName}/${serviceName}.service.ts`);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Service não encontrado: ${servicePath}`);
    return false;
  }

  let content = fs.readFileSync(servicePath, 'utf-8');
  
  // Verificar se já foi atualizado
  if (content.includes('user?: AuthPayload')) {
    console.log(`✅ ${serviceName}.service.ts já atualizado`);
    return true;
  }

  console.log(`📝 Atualizando ${serviceName}.service.ts...`);

  // Criar backup
  fs.writeFileSync(servicePath + '.backup', content);

  // Adicionar imports
  content = addImportsToService(content);

  // Aplicar padrões de atualização (básico - apenas assinaturas)
  // Nota: Aplicação completa de filtros requer análise mais complexa
  Object.entries(PATTERNS).forEach(([key, pattern]) => {
    if (key.includes('Method')) {
      content = content.replace(pattern.old, pattern.new);
    }
  });

  // Salvar arquivo atualizado
  fs.writeFileSync(servicePath, content);
  
  console.log(`   ✅ Imports adicionados`);
  console.log(`   ✅ Assinaturas de métodos atualizadas`);
  console.log(`   ⚠️  ATENÇÃO: Você ainda precisa:`);
  console.log(`      1. Adicionar applySchoolFilter(query, user) nas queries`);
  console.log(`      2. Adicionar canAccessSchool(user, school_id) nas validações`);
  console.log(`      3. Forçar school_id no create() baseado no usuário`);
  console.log(`   📦 Backup criado: ${serviceName}.service.ts.backup\n`);
  
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
    console.log(`✅ ${serviceName}.controller.ts já atualizado`);
    return true;
  }

  console.log(`📝 Atualizando ${serviceName}.controller.ts...`);

  // Criar backup
  fs.writeFileSync(controllerPath + '.backup', content);

  // Aplicar padrões de atualização do controller
  Object.entries(PATTERNS).forEach(([key, pattern]) => {
    if (!key.includes('Method')) {
      content = content.replace(pattern.old, pattern.new);
    }
  });

  // Salvar arquivo atualizado
  fs.writeFileSync(controllerPath, content);
  
  console.log(`   ✅ Chamadas ao service atualizadas com req.user`);
  console.log(`   📦 Backup criado: ${serviceName}.controller.ts.backup\n`);
  
  return true;
}

function generateManualStepsFile() {
  const stepsContent = `# Passos Manuais Necessários Após o Script

## ⚠️ IMPORTANTE

O script automatizou:
- ✅ Adição de imports
- ✅ Atualização de assinaturas de métodos
- ✅ Atualização de chamadas no controller

## 🔧 Você ainda precisa fazer MANUALMENTE em cada service:

### 1. No método \`list()\`

\`\`\`typescript
async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
  const { offset } = paginate(page, limit);
  
  // ADICIONAR ESTAS LINHAS:
  let query = db('table');
  query = applySchoolFilter(query, user);
  
  const results = await query.select('*').limit(limit).offset(offset);
  return results;
}
\`\`\`

### 2. No método \`getById()\`

\`\`\`typescript
async getById(id: string, user?: AuthPayload) {
  const item = await db('table').where('id', id).first();
  if (!item) throw new AppError('Não encontrado', 404);
  
  // ADICIONAR ESTAS LINHAS:
  if (user && !canAccessSchool(user, item.school_id)) {
    throw new AppError('Sem permissão', 403);
  }
  
  return item;
}
\`\`\`

### 3. No método \`create()\`

\`\`\`typescript
async create(data: any, user?: AuthPayload) {
  // ADICIONAR ESTAS LINHAS NO INÍCIO:
  const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
  if (!schoolId) throw new AppError('Escola não especificada', 400);
  
  const [item] = await db('table')
    .insert({ ...data, school_id: schoolId }) // Usar schoolId aqui
    .returning('*');
  return item;
}
\`\`\`

### 4. No método \`update()\`

\`\`\`typescript
async update(id: string, data: any, user?: AuthPayload) {
  // ADICIONAR ESTA LINHA NO INÍCIO:
  await this.getById(id, user); // Valida acesso
  
  const [item] = await db('table').where('id', id).update(data).returning('*');
  return item;
}
\`\`\`

### 5. No método \`delete()\`

\`\`\`typescript
async delete(id: string, user?: AuthPayload) {
  // ADICIONAR ESTA LINHA NO INÍCIO:
  await this.getById(id, user); // Valida acesso
  
  await db('table').where('id', id).delete();
}
\`\`\`

## 📋 Checklist por Serviço

### Assiduidade
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Financeiro
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Horarios
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Documentos
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Relatorios
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] Métodos de agregação - Aplicar filtros

### Comunicacao
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

## 🧪 Testar Cada Serviço

Após completar manualmente:

1. Login como Gestor A
2. Criar recurso
3. Listar recursos (deve ver apenas da sua escola)
4. Tentar acessar recurso de outra escola (deve dar 403)
5. Login como Admin
6. Listar recursos (deve ver de todas as escolas)

## 📖 Referências

Consulte os serviços já implementados como exemplo:
- students.service.ts
- teachers.service.ts
- classes.service.ts
- courses.service.ts
- subjects.service.ts
- guardians.service.ts
- matriculas.service.ts
- avaliacoes.service.ts
`;

  fs.writeFileSync(
    path.join(__dirname, '../PASSOS_MANUAIS_SEGREGACAO.md'),
    stepsContent
  );
  
  console.log('📄 Arquivo criado: PASSOS_MANUAIS_SEGREGACAO.md');
}

// Executar script
console.log('🚀 Iniciando aplicação automática de segregação...\n');
console.log('='.repeat(60));

let successCount = 0;
let totalServices = SERVICES_TO_UPDATE.length * 2; // service + controller

SERVICES_TO_UPDATE.forEach(serviceName => {
  console.log(`\n📦 Processando: ${serviceName.toUpperCase()}`);
  console.log('-'.repeat(60));
  
  if (updateServiceFile(serviceName)) successCount++;
  if (updateControllerFile(serviceName)) successCount++;
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Script concluído! ${successCount}/${totalServices} arquivos processados\n`);

generateManualStepsFile();

console.log('\n📋 PRÓXIMOS PASSOS:\n');
console.log('1. Revise os arquivos .backup criados');
console.log('2. Abra PASSOS_MANUAIS_SEGREGACAO.md');
console.log('3. Complete as implementações manuais necessárias');
console.log('4. Teste cada serviço com diferentes usuários');
console.log('5. Delete os arquivos .backup após confirmar que está tudo OK\n');

console.log('⚠️  LEMBRE-SE: O script fez apenas 40% do trabalho!');
console.log('   Os 60% restantes (filtros e validações) precisam ser feitos manualmente.\n');

console.log('📖 Consulte os serviços já implementados como referência:');
console.log('   - students.service.ts (exemplo completo)');
console.log('   - teachers.service.ts (exemplo completo)');
console.log('   - avaliacoes.service.ts (exemplo completo)\n');

console.log('='.repeat(60));
