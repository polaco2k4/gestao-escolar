import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthPayload } from '../../middleware/auth';

export interface LicensePlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  max_students?: number;
  max_teachers?: number;
  max_classes?: number;
  max_storage_mb?: number;
  features: any;
  price_monthly: number;
  active: boolean;
}

export interface License {
  id: string;
  school_id: string;
  plan_id: string;
  status: 'active' | 'suspended' | 'expired' | 'trial';
  start_date: Date;
  end_date?: Date;
  trial_ends_at?: Date;
  auto_renew: boolean;
  notes?: string;
}

export interface LicenseUsage {
  current_students: number;
  current_teachers: number;
  current_classes: number;
  storage_used_mb: number;
  max_students?: number;
  max_teachers?: number;
  max_classes?: number;
  max_storage_mb?: number;
  students_percentage: number;
  teachers_percentage: number;
  classes_percentage: number;
  storage_percentage: number;
}

export class LicensesService {
  // ============ PLANOS DE LICENÇA ============
  
  async listPlans() {
    const plans = await db('license_plans')
      .where('active', true)
      .orderBy('price_monthly', 'asc');
    
    return { plans };
  }

  async getPlanById(id: string) {
    const plan = await db('license_plans')
      .where('id', id)
      .first();

    if (!plan) throw new AppError('Plano não encontrado', 404);
    return plan;
  }

  async createPlan(data: Partial<LicensePlan>) {
    const [plan] = await db('license_plans')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return plan;
  }

  async updatePlan(id: string, data: Partial<LicensePlan>) {
    const [plan] = await db('license_plans')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!plan) throw new AppError('Plano não encontrado', 404);
    return plan;
  }

  // ============ LICENÇAS ============

  async listLicenses(user?: AuthPayload) {
    let query = db('licenses as l')
      .join('schools as s', 'l.school_id', 's.id')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select(
        'l.*',
        's.name as school_name',
        's.code as school_code',
        'lp.name as plan_name',
        'lp.display_name as plan_display_name',
        'lp.max_students',
        'lp.max_teachers',
        'lp.max_classes'
      );

    // Se for gestor, mostrar apenas sua escola
    if (user?.role === 'gestor' && user.school_id) {
      query = query.where('l.school_id', user.school_id);
    }

    const licenses = await query.orderBy('s.name', 'asc');
    return { licenses };
  }

  async getLicenseById(id: string, user?: AuthPayload) {
    const license = await db('licenses as l')
      .join('schools as s', 'l.school_id', 's.id')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select(
        'l.*',
        's.name as school_name',
        's.code as school_code',
        'lp.name as plan_name',
        'lp.display_name as plan_display_name',
        'lp.max_students',
        'lp.max_teachers',
        'lp.max_classes',
        'lp.max_storage_mb',
        'lp.features'
      )
      .where('l.id', id)
      .first();

    if (!license) throw new AppError('Licença não encontrada', 404);

    // Verificar acesso se for gestor
    if (user?.role === 'gestor' && license.school_id !== user.school_id) {
      throw new AppError('Sem permissão para acessar esta licença', 403);
    }

    return license;
  }

  async getLicenseBySchoolId(schoolId: string, user?: AuthPayload) {
    // Verificar acesso se for gestor
    if (user?.role === 'gestor' && schoolId !== user.school_id) {
      throw new AppError('Sem permissão para acessar esta licença', 403);
    }

    const license = await db('licenses as l')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select(
        'l.*',
        'lp.name as plan_name',
        'lp.display_name as plan_display_name',
        'lp.max_students',
        'lp.max_teachers',
        'lp.max_classes',
        'lp.max_storage_mb',
        'lp.features'
      )
      .where('l.school_id', schoolId)
      .first();

    if (!license) throw new AppError('Licença não encontrada para esta escola', 404);
    return license;
  }

  async createLicense(data: {
    school_id: string;
    plan_id: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
    trial_ends_at?: Date;
    auto_renew?: boolean;
    notes?: string;
  }) {
    // Verificar se escola já tem licença
    const existing = await db('licenses')
      .where('school_id', data.school_id)
      .first();

    if (existing) {
      throw new AppError('Esta escola já possui uma licença', 400);
    }

    // Verificar se plano existe
    await this.getPlanById(data.plan_id);

    const [license] = await db('licenses')
      .insert({
        ...data,
        status: data.status || 'active',
        start_date: data.start_date || new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return license;
  }

  async updateLicense(id: string, data: Partial<License>) {
    const [license] = await db('licenses')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!license) throw new AppError('Licença não encontrada', 404);
    return license;
  }

  async deleteLicense(id: string) {
    const deleted = await db('licenses')
      .where('id', id)
      .delete();

    if (!deleted) throw new AppError('Licença não encontrada', 404);
    return { message: 'Licença eliminada com sucesso' };
  }

  // ============ VERIFICAÇÃO DE LIMITES ============

  async checkLimits(schoolId: string): Promise<{
    valid: boolean;
    license: any;
    usage: LicenseUsage;
    violations: string[];
  }> {
    const license = await this.getLicenseBySchoolId(schoolId);
    const usage = await this.getUsage(schoolId);

    const violations: string[] = [];

    // Verificar status da licença
    if (license.status === 'expired') {
      violations.push('Licença expirada');
    }
    if (license.status === 'suspended') {
      violations.push('Licença suspensa');
    }

    // Verificar data de expiração
    if (license.end_date && new Date(license.end_date) < new Date()) {
      violations.push('Licença expirou em ' + new Date(license.end_date).toLocaleDateString());
    }

    // Verificar trial
    if (license.status === 'trial' && license.trial_ends_at && new Date(license.trial_ends_at) < new Date()) {
      violations.push('Período trial expirou');
    }

    // Verificar limites (null = ilimitado)
    if (license.max_students && usage.current_students > license.max_students) {
      violations.push(`Limite de alunos excedido (${usage.current_students}/${license.max_students})`);
    }
    if (license.max_teachers && usage.current_teachers > license.max_teachers) {
      violations.push(`Limite de professores excedido (${usage.current_teachers}/${license.max_teachers})`);
    }
    if (license.max_classes && usage.current_classes > license.max_classes) {
      violations.push(`Limite de turmas excedido (${usage.current_classes}/${license.max_classes})`);
    }

    return {
      valid: violations.length === 0,
      license,
      usage,
      violations
    };
  }

  async getUsage(schoolId: string): Promise<LicenseUsage> {
    const license = await this.getLicenseBySchoolId(schoolId);

    const statsResult = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'estudante') as current_students,
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'professor') as current_teachers,
        (SELECT COUNT(*) FROM classes WHERE school_id = ?) as current_classes,
        0 as storage_used_mb
    `, [schoolId, schoolId, schoolId]);

    const usage = statsResult.rows[0];

    // Calcular percentagens
    const calculatePercentage = (current: number, max?: number) => {
      if (!max) return 0; // Ilimitado
      return Math.round((current / max) * 100);
    };

    return {
      current_students: parseInt(usage.current_students),
      current_teachers: parseInt(usage.current_teachers),
      current_classes: parseInt(usage.current_classes),
      storage_used_mb: parseInt(usage.storage_used_mb),
      max_students: license.max_students,
      max_teachers: license.max_teachers,
      max_classes: license.max_classes,
      max_storage_mb: license.max_storage_mb,
      students_percentage: calculatePercentage(usage.current_students, license.max_students),
      teachers_percentage: calculatePercentage(usage.current_teachers, license.max_teachers),
      classes_percentage: calculatePercentage(usage.current_classes, license.max_classes),
      storage_percentage: calculatePercentage(usage.storage_used_mb, license.max_storage_mb)
    };
  }

  // ============ ESTATÍSTICAS PARA ADMIN ============

  async getGlobalStats() {
    const statsResult = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM schools WHERE active = true) as total_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'estudante') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'professor') as total_teachers,
        (SELECT COUNT(*) FROM classes) as total_classes,
        (SELECT COUNT(*) FROM licenses WHERE status = 'active') as active_licenses,
        (SELECT COUNT(*) FROM licenses WHERE status = 'trial') as trial_licenses,
        (SELECT COUNT(*) FROM licenses WHERE status = 'expired') as expired_licenses,
        (SELECT COUNT(*) FROM licenses WHERE status = 'suspended') as suspended_licenses
    `);

    const summary = statsResult.rows[0];

    const licensesByPlan = await db('licenses as l')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select('lp.display_name as plan_name')
      .count('* as count')
      .groupBy('lp.display_name');

    const expiringLicenses = await db('licenses as l')
      .join('schools as s', 'l.school_id', 's.id')
      .join('license_plans as lp', 'l.plan_id', 'lp.id')
      .select(
        'l.id',
        's.name as school_name',
        'lp.display_name as plan_name',
        'l.end_date',
        'l.trial_ends_at',
        'l.status'
      )
      .where(function() {
        this.where('l.end_date', '<=', db.raw("CURRENT_DATE + INTERVAL '30 days'"))
          .orWhere('l.trial_ends_at', '<=', db.raw("CURRENT_DATE + INTERVAL '7 days'"));
      })
      .whereIn('l.status', ['active', 'trial'])
      .orderByRaw('COALESCE(l.end_date, l.trial_ends_at) ASC NULLS LAST')
      .limit(10);

    return {
      summary,
      licenses_by_plan: licensesByPlan,
      expiring_soon: expiringLicenses
    };
  }
}
