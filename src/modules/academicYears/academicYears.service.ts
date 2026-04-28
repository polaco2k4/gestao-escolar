import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthPayload } from '../../middleware/auth';

function canAccessSchool(user: AuthPayload, schoolId: string): boolean {
  if (user.role === 'admin') return true;
  return user.school_id === schoolId;
}

export class AcademicYearsService {
  async list(user?: AuthPayload) {
    const query = db('academic_years')
      .select('*')
      .orderBy('is_current', 'desc')
      .orderBy('start_date', 'desc');

    if (user && user.role !== 'admin' && user.school_id) {
      query.where('school_id', user.school_id);
    }

    const academicYears = await query;
    return { academicYears };
  }

  async getById(id: string, user?: AuthPayload) {
    const academicYear = await db('academic_years')
      .where('id', id)
      .first();

    if (!academicYear) throw new AppError('Ano lectivo não encontrado', 404);

    if (user && !canAccessSchool(user, academicYear.school_id)) {
      throw new AppError('Sem permissão para acessar este ano lectivo', 403);
    }

    return academicYear;
  }

  async getCurrent(user?: AuthPayload) {
    const query = db('academic_years').where('is_current', true);

    if (user && user.role !== 'admin' && user.school_id) {
      query.where('school_id', user.school_id);
    }

    const academicYear = await query.first();
    if (!academicYear) throw new AppError('Nenhum ano lectivo activo encontrado', 404);
    return academicYear;
  }

  async create(data: any, user?: AuthPayload) {
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;

    if (!schoolId) {
      throw new AppError('school_id é obrigatório', 400);
    }

    if (!data.name || !data.start_date || !data.end_date) {
      throw new AppError('Nome, data de início e data de fim são obrigatórios', 400);
    }

    const trx = await db.transaction();

    try {
      if (data.is_current) {
        await trx('academic_years')
          .where('school_id', schoolId)
          .update({ is_current: false, updated_at: new Date() });
      }

      const [academicYear] = await trx('academic_years')
        .insert({
          school_id: schoolId,
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          is_current: data.is_current || false,
        })
        .returning('*');

      await trx.commit();
      return academicYear;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, data: any, user?: AuthPayload) {
    const existing = await this.getById(id, user);

    const trx = await db.transaction();

    try {
      if (data.is_current && !existing.is_current) {
        await trx('academic_years')
          .where('school_id', existing.school_id)
          .whereNot('id', id)
          .update({ is_current: false, updated_at: new Date() });
      }

      const [academicYear] = await trx('academic_years')
        .where('id', id)
        .update({
          name: data.name ?? existing.name,
          start_date: data.start_date ?? existing.start_date,
          end_date: data.end_date ?? existing.end_date,
          is_current: data.is_current ?? existing.is_current,
          updated_at: new Date(),
        })
        .returning('*');

      await trx.commit();
      return academicYear;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(id: string, user?: AuthPayload) {
    const existing = await this.getById(id, user);

    if (existing.is_current) {
      throw new AppError('Não é possível eliminar o ano lectivo activo. Defina outro como activo primeiro.', 400);
    }

    await db('academic_years').where('id', id).delete();
    return { deleted: true };
  }
}
