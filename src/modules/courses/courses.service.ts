import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class CoursesService {
  async list(filters: { school_id?: string } = {}) {
    const query = db('courses')
      .select('*')
      .where('active', true)
      .orderBy('name', 'asc');

    if (filters.school_id) {
      query.where('school_id', filters.school_id);
    }

    const courses = await query;
    return { courses };
  }

  async getById(id: string) {
    const course = await db('courses')
      .where('id', id)
      .first();

    if (!course) throw new AppError('Curso não encontrado', 404);
    return course;
  }

  async create(data: {
    school_id: string;
    name: string;
    code: string;
    level?: string;
    duration_years?: number;
  }) {
    const existingCourse = await db('courses')
      .where('code', data.code)
      .where('school_id', data.school_id)
      .first();

    if (existingCourse) {
      throw new AppError('Já existe um curso com este código nesta escola', 400);
    }

    const [course] = await db('courses')
      .insert({
        ...data,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return course;
  }

  async update(id: string, data: {
    name?: string;
    code?: string;
    level?: string;
    duration_years?: number;
    active?: boolean;
  }) {
    const [course] = await db('courses')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!course) throw new AppError('Curso não encontrado', 404);
    return course;
  }

  async delete(id: string) {
    const classes = await db('classes')
      .where('course_id', id)
      .count('* as count')
      .first();

    if (classes && parseInt(classes.count as string) > 0) {
      throw new AppError('Não é possível eliminar curso com turmas associadas', 400);
    }

    const deleted = await db('courses')
      .where('id', id)
      .delete();

    if (!deleted) throw new AppError('Curso não encontrado', 404);
    return { message: 'Curso eliminado com sucesso' };
  }
}
