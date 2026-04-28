-- Tabela de relatórios personalizados
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL, -- 'students', 'attendance', 'grades', 'financial', 'enrollments', 'custom'
  filters JSONB DEFAULT '{}', -- Filtros salvos em formato JSON
  columns JSONB DEFAULT '[]', -- Colunas a serem exibidas
  sort_by VARCHAR(100),
  sort_order VARCHAR(4) DEFAULT 'asc', -- 'asc' ou 'desc'
  created_by UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT false, -- Se outros usuários da escola podem ver
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_custom_reports_school_id ON custom_reports(school_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON custom_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_reports_report_type ON custom_reports(report_type);

-- Tabela de execuções de relatórios (histórico)
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  executed_by UUID NOT NULL REFERENCES users(id),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  row_count INTEGER,
  execution_time_ms INTEGER,
  filters_used JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_report_executions_report_id ON report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_at ON report_executions(executed_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_custom_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_custom_reports_updated_at ON custom_reports;
CREATE TRIGGER trigger_update_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_reports_updated_at();
