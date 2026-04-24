-- Seed academic year
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current)
SELECT 
  id,
  '2025-2026',
  '2025-09-01',
  '2026-07-31',
  true
FROM schools
LIMIT 1
ON CONFLICT DO NOTHING;
