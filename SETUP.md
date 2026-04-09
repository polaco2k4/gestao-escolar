# Guia de Configuração - Sistema de Gestão Escolar

## ✅ Status da Instalação

- ✅ Dependências instaladas
- ✅ Base de dados `gestao_escolar` criada
- ✅ Migração executada com sucesso (29 tabelas criadas)
- ⚠️ Servidor pronto para iniciar

## 📋 Configuração do Ficheiro .env

O ficheiro `.env` já deve estar criado. Certifique-se de que contém as seguintes configurações:

```env
# Server
NODE_ENV=development
PORT=3001  # Altere se a porta 3000 estiver ocupada

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestao_escolar
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui  # IMPORTANTE: Altere isto!

# Redis (opcional para desenvolvimento)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=mude_este_secret_em_producao_use_algo_seguro
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=outro_secret_diferente_para_refresh
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (SMTP) - Opcional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# SMS Provider - Opcional
SMS_API_KEY=sua_chave_sms
SMS_API_URL=https://api.sms-provider.com

# Payment Gateway - Opcional
MULTICAIXA_API_KEY=sua_chave_multicaixa
MULTICAIXA_API_URL=https://api.multicaixa.ao
PAYWAY_API_KEY=sua_chave_payway

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 🚀 Iniciar o Servidor

### Opção 1: Porta padrão (3000)
Se a porta 3000 estiver livre:
```bash
npm run dev
```

### Opção 2: Porta alternativa (3001)
Se a porta 3000 estiver ocupada, edite o `.env` e altere:
```
PORT=3001
```
Depois execute:
```bash
npm run dev
```

### Opção 3: Matar processo na porta 3000
Se quiser usar a porta 3000, mate o processo existente:
```bash
# Windows
taskkill /PID 9924 /F

# Depois inicie o servidor
npm run dev
```

## 📊 Tabelas Criadas na Base de Dados

29 tabelas foram criadas com sucesso:
- academic_years
- assessment_types
- assessments
- attendance_justifications
- attendance_records
- classes
- courses
- document_templates
- documents
- enrollments
- fee_types
- grade_sheets
- grades
- guardians
- message_recipients
- messages
- notifications
- payments
- refresh_tokens
- rooms
- schedules
- schools
- student_fees
- students
- subjects
- teacher_subjects
- teachers
- transfers
- users

## 🧪 Testar a API

Após iniciar o servidor, teste o endpoint de health:

```bash
# Health check
curl http://localhost:3001/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2026-04-09T17:23:45.123Z"
}
```

## 📡 Endpoints Principais

### Autenticação
```bash
POST http://localhost:3001/api/auth/register
POST http://localhost:3001/api/auth/login
GET  http://localhost:3001/api/auth/me
```

### Matrículas
```bash
GET  http://localhost:3001/api/matriculas
POST http://localhost:3001/api/matriculas
```

### Avaliações
```bash
GET  http://localhost:3001/api/avaliacoes
POST http://localhost:3001/api/avaliacoes
```

### Horários
```bash
GET  http://localhost:3001/api/horarios/schedules
GET  http://localhost:3001/api/horarios/classes
```

### Financeiro
```bash
GET  http://localhost:3001/api/financeiro/student-fees
POST http://localhost:3001/api/financeiro/payments
```

### Comunicação
```bash
GET  http://localhost:3001/api/comunicacao/messages
POST http://localhost:3001/api/comunicacao/messages
```

### Assiduidade
```bash
GET  http://localhost:3001/api/assiduidade
POST http://localhost:3001/api/assiduidade/bulk
```

### Documentos
```bash
GET  http://localhost:3001/api/documentos
POST http://localhost:3001/api/documentos
```

### Relatórios
```bash
GET  http://localhost:3001/api/relatorios/students
GET  http://localhost:3001/api/relatorios/attendance
GET  http://localhost:3001/api/relatorios/grades
```

## 🔐 Criar Primeiro Utilizador

Use um cliente HTTP (Postman, Insomnia, ou curl) para criar o primeiro utilizador admin:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@escola.ao",
    "password": "Admin@123",
    "first_name": "Admin",
    "last_name": "Sistema",
    "role": "admin",
    "school_id": "uuid-da-escola"
  }'
```

## 📝 Próximos Passos

1. ✅ Configurar `.env` com credenciais corretas
2. ✅ Iniciar servidor de desenvolvimento
3. ⏳ Criar primeiro utilizador admin
4. ⏳ Criar escola no sistema
5. ⏳ Testar endpoints principais
6. ⏳ Desenvolver frontend (React)

## 🐛 Resolução de Problemas

### Erro: "Cannot connect to database"
- Verifique se PostgreSQL está a correr
- Confirme credenciais no `.env`
- Teste conexão: `psql -U postgres -d gestao_escolar`

### Erro: "Port already in use"
- Altere a porta no `.env`
- Ou mate o processo: `taskkill /PID <pid> /F`

### Erro: "Redis connection failed"
- Redis é opcional para desenvolvimento
- Comente as linhas relacionadas com Redis se não estiver instalado

## 📚 Documentação Adicional

Consulte o `README.md` para informação completa sobre:
- Arquitetura do sistema
- Estrutura de módulos
- Tecnologias utilizadas
- Comandos disponíveis
