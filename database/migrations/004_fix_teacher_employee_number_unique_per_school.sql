-- ============================================
-- Corrigir employee_number para ser único por escola
-- ============================================

-- Remover a constraint UNIQUE global
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_employee_number_key;

-- Adicionar constraint UNIQUE composta (employee_number + school_id)
-- Isso permite que diferentes escolas usem o mesmo número
ALTER TABLE teachers 
ADD CONSTRAINT teachers_employee_number_school_unique 
UNIQUE (employee_number, school_id);

-- Comentário explicativo
COMMENT ON CONSTRAINT teachers_employee_number_school_unique ON teachers IS 
'Número de funcionário deve ser único dentro da mesma escola, mas pode repetir entre escolas diferentes';
