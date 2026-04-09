import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class SchoolsService {
  async list() {
    const schools = await db('schools')
      .select('*')
      .orderBy('name', 'asc');

    return { schools };
  }

  async getById(id: string) {
    const school = await db('schools')
      .where('id', id)
      .first();

    if (!school) throw new AppError('Escola não encontrada', 404);
    return school;
  }

  async create(data: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  }) {
    const existingSchool = await db('schools')
      .where('code', data.code)
      .first();

    if (existingSchool) {
      throw new AppError('Já existe uma escola com este código', 400);
    }

    const [school] = await db('schools')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return school;
  }

  async update(id: string, data: {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    active?: boolean;
  }) {
    if (data.code) {
      const existingSchool = await db('schools')
        .where('code', data.code)
        .whereNot('id', id)
        .first();

      if (existingSchool) {
        throw new AppError('Já existe uma escola com este código', 400);
      }
    }

    const [school] = await db('schools')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!school) throw new AppError('Escola não encontrada', 404);
    return school;
  }

  async delete(id: string) {
    const deleted = await db('schools')
      .where('id', id)
      .delete();

    if (!deleted) throw new AppError('Escola não encontrada', 404);
    return { message: 'Escola eliminada com sucesso' };
  }

  async getStats(id: string) {
    const school = await this.getById(id);

    const [stats] = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'estudante') as total_students,
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'professor') as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE school_id = ?) as total_classes,
        (SELECT COUNT(*) FROM courses WHERE school_id = ? AND active = true) as total_courses
    `, [id, id, id, id]);

    return {
      school,
      stats: stats.rows[0]
    };
  }
}
