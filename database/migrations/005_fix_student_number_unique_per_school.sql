-- ============================================
-- Corrigir student_number para ser único por escola
-- ============================================

-- Remover a constraint UNIQUE global
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_student_number_key;

-- Adicionar constraint UNIQUE composta (student_number + school_id)
-- Isso permite que diferentes escolas usem o mesmo número
ALTER TABLE students 
ADD CONSTRAINT students_student_number_school_unique 
UNIQUE (student_number, school_id);

-- Comentário explicativo
COMMENT ON CONSTRAINT students_student_number_school_unique ON students IS 
'Número de estudante deve ser único dentro da mesma escola, mas pode repetir entre escolas diferentes';
