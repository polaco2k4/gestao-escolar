-- Migration: Sistema de Licenças
-- Permite ao admin controlar limites de uso por escola

CREATE TABLE IF NOT EXISTS license_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_students INTEGER,
    max_teachers INTEGER,
    max_classes INTEGER,
    max_storage_mb INTEGER,
    features JSONB DEFAULT '{}',
    price_monthly DECIMAL(10, 2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES license_plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'trial')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    trial_ends_at DATE,
    auto_renew BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(school_id)
);

-- Índices para performance
CREATE INDEX idx_licenses_school_id ON licenses(school_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_end_date ON licenses(end_date);
CREATE INDEX idx_license_plans_active ON license_plans(active);

-- Inserir planos padrão
INSERT INTO license_plans (name, display_name, description, max_students, max_teachers, max_classes, max_storage_mb, price_monthly, features) VALUES
('trial', 'Trial', 'Período de teste gratuito por 30 dias', 50, 5, 10, 500, 0, '{"support": "email", "reports": "basic"}'),
('basic', 'Básico', 'Plano básico para escolas pequenas', 200, 20, 20, 2000, 25000, '{"support": "email", "reports": "basic", "api_access": false}'),
('premium', 'Premium', 'Plano completo para escolas médias', 500, 50, 50, 5000, 65000, '{"support": "priority", "reports": "advanced", "api_access": true, "custom_branding": true}'),
('enterprise', 'Enterprise', 'Plano ilimitado para grandes instituições', NULL, NULL, NULL, NULL, 150000, '{"support": "24/7", "reports": "custom", "api_access": true, "custom_branding": true, "dedicated_server": true}');

-- Adicionar licença trial para escolas existentes
INSERT INTO licenses (school_id, plan_id, status, trial_ends_at)
SELECT 
    s.id,
    (SELECT id FROM license_plans WHERE name = 'trial' LIMIT 1),
    'trial',
    CURRENT_DATE + INTERVAL '30 days'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM licenses l WHERE l.school_id = s.id
);

COMMENT ON TABLE license_plans IS 'Planos de licença disponíveis no sistema';
COMMENT ON TABLE licenses IS 'Licenças atribuídas a cada escola';
COMMENT ON COLUMN licenses.status IS 'Status da licença: active, suspended, expired, trial';
COMMENT ON COLUMN licenses.trial_ends_at IS 'Data de término do período trial';
