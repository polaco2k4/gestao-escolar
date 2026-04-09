# Sistema de Gestão Escolar - Backend API

Sistema completo de gestão escolar desenvolvido em Node.js + TypeScript + PostgreSQL.

## 🏗️ Arquitetura

- **Camada de Apresentação**: 4 portais React (Admin, Professor, Estudante, Encarregado)
- **API Gateway**: Node.js/Express com JWT Auth, Rate Limiting, Routing
- **Camada de Serviços**: 8 módulos principais
- **Infraestrutura**: PostgreSQL, Redis, File Storage, Bull Queue
- **Integrações**: Pagamentos (Multicaixa/PayWay), SMS/Email, Calendar, Export

## 📦 Módulos

1. **Auth** - Autenticação e autorização (JWT)
2. **Matrículas** - Inscrições e transferências
3. **Avaliações** - Notas, pautas, relatórios
4. **Horários** - Turmas, salas, disciplinas
5. **Financeiro** - Propinas e pagamentos
6. **Comunicação** - Mensagens e notificações
7. **Assiduidade** - Presenças e justificações
8. **Documentos** - Declarações e certificados
9. **Relatórios** - Analytics e dashboards

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Copiar ficheiro de ambiente
cp .env.example .env

# Configurar variáveis de ambiente no .env

# Executar migrações
npm run migrate

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🗄️ Base de Dados

O schema PostgreSQL inclui:
- Utilizadores e perfis (admin, professor, estudante, encarregado)
- Escolas e anos lectivos
- Turmas, disciplinas e horários
- Matrículas e transferências
- Avaliações e notas
- Propinas e pagamentos
- Presenças e justificações
- Mensagens e notificações
- Documentos

Execute `npm run migrate` para criar todas as tabelas.

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

```bash
POST /api/auth/register - Registar utilizador
POST /api/auth/login - Login
POST /api/auth/refresh-token - Renovar token
GET /api/auth/me - Perfil do utilizador
```

## 📡 Endpoints Principais

### Matrículas
- `GET /api/matriculas` - Listar matrículas
- `POST /api/matriculas` - Criar matrícula
- `POST /api/matriculas/transfers` - Criar transferência

### Avaliações
- `GET /api/avaliacoes` - Listar avaliações
- `POST /api/avaliacoes/:id/grades` - Guardar notas
- `GET /api/avaliacoes/sheets/list` - Listar pautas

### Horários
- `GET /api/horarios/schedules` - Listar horários
- `GET /api/horarios/classes` - Listar turmas
- `GET /api/horarios/by-class/:classId` - Horário por turma

### Financeiro
- `GET /api/financeiro/student-fees` - Listar propinas
- `POST /api/financeiro/payments` - Registar pagamento
- `GET /api/financeiro/summary` - Resumo financeiro

### Comunicação
- `GET /api/comunicacao/messages` - Listar mensagens
- `POST /api/comunicacao/messages` - Enviar mensagem
- `GET /api/comunicacao/notifications` - Listar notificações

### Assiduidade
- `GET /api/assiduidade` - Listar presenças
- `POST /api/assiduidade/bulk` - Registar presenças em lote
- `GET /api/assiduidade/summary/student/:id` - Resumo de presenças

### Documentos
- `GET /api/documentos` - Listar documentos
- `POST /api/documentos` - Solicitar documento
- `POST /api/documentos/:id/upload` - Carregar ficheiro

### Relatórios
- `GET /api/relatorios/students` - Relatório de estudantes
- `GET /api/relatorios/attendance` - Relatório de presenças
- `GET /api/relatorios/grades` - Relatório de notas
- `GET /api/relatorios/financial` - Relatório financeiro

## 🔧 Tecnologias

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Knex.js)
- **Cache**: Redis (ioredis)
- **Queue**: Bull (BullMQ)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

## 📝 Variáveis de Ambiente

Consulte `.env.example` para todas as variáveis necessárias:
- Configuração do servidor (PORT, NODE_ENV)
- PostgreSQL (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Redis (REDIS_HOST, REDIS_PORT)
- JWT (JWT_SECRET, JWT_EXPIRES_IN)
- Email/SMS
- Gateways de pagamento

## 🧪 Testes

```bash
npm test
```

## 📄 Licença

Propriedade privada - Todos os direitos reservados
