-- ========================================
-- Script para Associar Usuário a uma Escola
-- ========================================

-- 1. Ver todas as escolas existentes
SELECT id, name, created_at FROM schools ORDER BY created_at DESC;

-- 2. Ver o usuário admin
SELECT id, email, school_id, first_name, last_name FROM users WHERE email = 'admin@escola.ao';

-- 3. Se já existir uma escola, associar o usuário a ela
-- SUBSTITUA 'SCHOOL_ID_AQUI' pelo ID da escola que apareceu no SELECT acima
-- UPDATE users 
-- SET school_id = 'SCHOOL_ID_AQUI'
-- WHERE email = 'admin@escola.ao';

-- 4. OU, se não existir escola, criar uma nova e associar o usuário
-- Descomente e execute as linhas abaixo:

-- INSERT INTO schools (name, address, phone, email, active)
-- VALUES ('Escola Principal', 'Luanda, Angola', '+244 900 000 000', 'escola@exemplo.ao', true)
-- RETURNING id;

-- Depois pegue o ID retornado e execute:
-- UPDATE users 
-- SET school_id = 'ID_DA_ESCOLA_CRIADA'
-- WHERE email = 'admin@escola.ao';

-- 5. Verificar se funcionou
SELECT u.id, u.email, u.school_id, s.name as school_name
FROM users u
LEFT JOIN schools s ON u.school_id = s.id
WHERE u.email = 'admin@escola.ao';
