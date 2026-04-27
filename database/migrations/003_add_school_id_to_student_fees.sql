-- ============================================
-- Adicionar school_id à tabela student_fees
-- ============================================

-- Adicionar coluna school_id à tabela student_fees
ALTER TABLE student_fees 
ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Preencher school_id baseado no student
UPDATE student_fees sf
SET school_id = s.school_id
FROM students s
WHERE sf.student_id = s.id;

-- Tornar a coluna NOT NULL após preencher os dados
ALTER TABLE student_fees 
ALTER COLUMN school_id SET NOT NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_student_fees_school_id ON student_fees(school_id);

-- Comentário explicativo
COMMENT ON COLUMN student_fees.school_id IS 'Referência à escola para segregação de dados';
