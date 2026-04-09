# 🚀 Início Rápido - Gestão Escolar API

## ✅ Status Actual
- ✅ Dependências instaladas
- ✅ Base de dados criada
- ✅ 29 tabelas migradas com sucesso
- ⚠️ Redis opcional (não necessário para desenvolvimento)

## 📝 Configurar .env

**IMPORTANTE:** Edite o ficheiro `.env` e configure a porta:

```bash
# Abra o ficheiro .env e altere:
PORT=5000

# Ou qualquer porta livre (3002, 4000, 8000, etc.)
```

Configuração mínima necessária no `.env`:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestao_escolar
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI

JWT_SECRET=mude_este_secret_em_producao
JWT_EXPIRES_IN=24h
```

## 🚀 Iniciar Servidor

```bash
npm run dev
```

**Servidor deve iniciar em:** `http://localhost:5000`

## 🧪 Testar API

Abra o navegador ou use curl:

```bash
# Health check
curl http://localhost:5000/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2026-04-09T..."
}
```

## 🔐 Criar Primeiro Utilizador Admin

Use Postman, Insomnia ou curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@escola.ao\",
    \"password\": \"Admin@123\",
    \"first_name\": \"Admin\",
    \"last_name\": \"Sistema\",
    \"role\": \"admin\"
  }"
```

## 📡 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` - Registar utilizador
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil (requer token)

### Matrículas
- `GET /api/matriculas` - Listar matrículas
- `POST /api/matriculas` - Criar matrícula

### Avaliações
- `GET /api/avaliacoes` - Listar avaliações
- `POST /api/avaliacoes` - Criar avaliação

### Horários
- `GET /api/horarios/schedules` - Listar horários
- `GET /api/horarios/classes` - Listar turmas

### Financeiro
- `GET /api/financeiro/student-fees` - Listar propinas
- `POST /api/financeiro/payments` - Registar pagamento

### Comunicação
- `GET /api/comunicacao/messages` - Listar mensagens
- `POST /api/comunicacao/messages` - Enviar mensagem

### Assiduidade
- `GET /api/assiduidade` - Listar presenças
- `POST /api/assiduidade/bulk` - Registar presenças em lote

### Documentos
- `GET /api/documentos` - Listar documentos
- `POST /api/documentos` - Solicitar documento

### Relatórios
- `GET /api/relatorios/students` - Relatório de estudantes
- `GET /api/relatorios/attendance` - Relatório de presenças
- `GET /api/relatorios/grades` - Relatório de notas

## ⚠️ Resolução de Problemas

### Porta já em uso
Se aparecer `EADDRINUSE`, altere a porta no `.env`:
```env
PORT=5000  # ou 3002, 4000, 8000, etc.
```

### Redis não disponível
Redis é **opcional** para desenvolvimento. O servidor inicia sem ele.
Para instalar Redis (opcional):
- Windows: https://github.com/microsoftarchive/redis/releases
- Ou use Docker: `docker run -d -p 6379:6379 redis`

### Erro de conexão à base de dados
Verifique:
1. PostgreSQL está a correr
2. Base de dados `gestao_escolar` existe
3. Credenciais no `.env` estão correctas

## 📊 Estrutura da Base de Dados

29 tabelas criadas:
- **Utilizadores:** users, teachers, students, guardians
- **Académico:** schools, academic_years, courses, classes, subjects
- **Matrículas:** enrollments, transfers
- **Avaliações:** assessments, grades, grade_sheets
- **Horários:** schedules, rooms
- **Financeiro:** fee_types, student_fees, payments
- **Assiduidade:** attendance_records, attendance_justifications
- **Comunicação:** messages, notifications
- **Documentos:** documents, document_templates

## 🎯 Próximos Passos

1. ✅ Editar `.env` com PORT=5000
2. ✅ Executar `npm run dev`
3. ⏳ Testar endpoint `/health`
4. ⏳ Criar primeiro utilizador admin
5. ⏳ Testar endpoints com Postman/Insomnia
6. ⏳ Desenvolver frontend React

## 📚 Documentação Completa

- `README.md` - Documentação completa da API
- `SETUP.md` - Guia de configuração detalhado
- `.env.example` - Exemplo de variáveis de ambiente
