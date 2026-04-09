-- ============================================
-- SEED: Disciplinas, Professores e Tipos de Avaliação
-- ============================================

-- Obter IDs necessários
DO $$
DECLARE
    v_school_id UUID;
    v_admin_id UUID;
    v_teacher_user_id UUID;
    v_teacher_id UUID;
BEGIN
    -- Obter a primeira escola
    SELECT id INTO v_school_id FROM schools LIMIT 1;
    
    -- Se não houver escola, criar uma
    IF v_school_id IS NULL THEN
        INSERT INTO schools (name, code, email, phone, address)
        VALUES ('Escola Exemplo', 'ESC001', 'escola@exemplo.com', '123456789', 'Luanda, Angola')
        RETURNING id INTO v_school_id;
    END IF;

    -- Criar usuário professor se não existir
    INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
    VALUES ('professor@escola.com', '$2b$10$YourHashHere', 'João', 'Silva', 'professor', true)
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_teacher_user_id;

    -- Se o usuário já existia, obter o ID
    IF v_teacher_user_id IS NULL THEN
        SELECT id INTO v_teacher_user_id FROM users WHERE email = 'professor@escola.com';
    END IF;

    -- Criar professor se não existir
    INSERT INTO teachers (user_id, school_id, employee_number, department, specialization)
    VALUES (v_teacher_user_id, v_school_id, 'PROF001', 'Ciências', 'Matemática')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_teacher_id;

    -- Inserir Tipos de Avaliação
    INSERT INTO assessment_types (school_id, name, weight, max_score) VALUES
    (v_school_id, 'Teste', 0.3, 20),
    (v_school_id, 'Exame', 0.4, 20),
    (v_school_id, 'Trabalho', 0.2, 20),
    (v_school_id, 'Participação', 0.1, 20)
    ON CONFLICT DO NOTHING;

    -- Inserir Disciplinas
    INSERT INTO subjects (school_id, name, code, credits, year_level) VALUES
    (v_school_id, 'Matemática', 'MAT', 4, 1),
    (v_school_id, 'Português', 'PORT', 4, 1),
    (v_school_id, 'Física', 'FIS', 3, 1),
    (v_school_id, 'Química', 'QUIM', 3, 1),
    (v_school_id, 'Biologia', 'BIO', 3, 1),
    (v_school_id, 'História', 'HIST', 2, 1),
    (v_school_id, 'Geografia', 'GEO', 2, 1),
    (v_school_id, 'Inglês', 'ING', 3, 1),
    (v_school_id, 'Educação Física', 'EDF', 2, 1),
    (v_school_id, 'Informática', 'INF', 2, 1)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed de disciplinas, professores e tipos de avaliação concluído!';
END $$;
