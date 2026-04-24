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

  async create(data: any, school_id?: string) {
    // Se school_id não foi fornecido, pegar a primeira escola disponível
    let finalSchoolId = school_id;
    
    if (!finalSchoolId) {
      const firstSchool = await db('schools').select('id').first();
      if (firstSchool) {
        finalSchoolId = firstSchool.id;
      } else {
        throw new AppError('Nenhuma escola encontrada no sistema', 400);
      }
    }
    
    const insertData = { ...data, school_id: finalSchoolId };
    const [subject] = await db('subjects').insert(insertData).returning('*');
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
