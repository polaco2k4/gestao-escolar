import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class TeachersService {
  async list() {
    const teachers = await db('teachers as t')
      .join('users as u', 'u.id', 't.user_id')
      .select('t.*', 'u.first_name', 'u.last_name', 'u.email')
      .orderBy('u.last_name', 'asc');
    return teachers;
  }

  async getById(id: string) {
    const teacher = await db('teachers as t')
      .join('users as u', 'u.id', 't.user_id')
      .select('t.*', 'u.first_name', 'u.last_name', 'u.email')
      .where('t.id', id)
      .first();

    if (!teacher) throw new AppError('Professor não encontrado', 404);
    return teacher;
  }

  async create(data: any) {
    const [teacher] = await db('teachers').insert(data).returning('*');
    return teacher;
  }

  async update(id: string, data: any) {
    const [teacher] = await db('teachers')
      .where({ id })
      .update(data)
      .returning('*');

    if (!teacher) throw new AppError('Professor não encontrado', 404);
    return teacher;
  }

  async delete(id: string) {
    const deleted = await db('teachers')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Professor não encontrado', 404);
    return true;
  }
}
