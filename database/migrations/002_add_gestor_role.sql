-- ============================================
-- Adicionar role 'gestor' ao sistema
-- ============================================

-- Remove a constraint antiga
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Adiciona a nova constraint com o role 'gestor'
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'gestor', 'professor', 'estudante', 'encarregado'));

-- Comentário explicativo
COMMENT ON COLUMN users.role IS 'Roles disponíveis: admin (cria escolas), gestor (faz tudo exceto criar escolas), professor, estudante, encarregado';
