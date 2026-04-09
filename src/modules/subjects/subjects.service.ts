import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class SubjectsService {
  async list() {
    const subjects = await db('subjects')
      .select('*')
      .orderBy('name', 'asc');
    return subjects;
  }

  async getById(id: string) {
    const subject = await db('subjects')
      .where({ id })
      .first();

    if (!subject) throw new AppError('Disciplina não encontrada', 404);
    return subject;
  }

  async create(data: any) {
    const [subject] = await db('subjects').insert(data).returning('*');
    return subject;
  }

  async update(id: string, data: any) {
    const [subject] = await db('subjects')
      .where({ id })
      .update(data)
      .returning('*');

    if (!subject) throw new AppError('Disciplina não encontrada', 404);
    return subject;
  }

  async delete(id: string) {
    const deleted = await db('subjects')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Disciplina não encontrada', 404);
    return true;
  }
}
