import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class SubjectsService {
  async list(user?: AuthPayload, filters?: { course_id?: string }) {
    let query = db('subjects as s')
      .leftJoin('courses as c', 'c.id', 's.course_id')
      .select('s.*', 'c.name as course_name');

    query = applySchoolFilter(query, user, 's');

    if (filters?.course_id) {
      query = query.where((builder: any) =>
        builder.where('s.course_id', filters.course_id).orWhereNull('s.course_id')
      );
    }

    const subjects = await query.orderBy('s.name', 'asc');
    return subjects;
  }

  async getById(id: string, user?: AuthPayload) {
    const subject = await db('subjects')
      .where({ id })
      .first();

    if (!subject) throw new AppError('Disciplina não encontrada', 404);
    
    // Validar acesso à escola
    if (user && !canAccessSchool(user, subject.school_id)) {
      throw new AppError('Sem permissão para acessar esta disciplina', 403);
    }
    
    return subject;
  }

  async create(data: any, user?: AuthPayload) {
    // Admin pode escolher escola, outros usam sua própria escola
    let finalSchoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    
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

  async update(id: string, data: any, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
    const [subject] = await db('subjects')
      .where({ id })
      .update(data)
      .returning('*');

    if (!subject) throw new AppError('Disciplina não encontrada', 404);
    return subject;
  }

  async delete(id: string, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
    const deleted = await db('subjects')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Disciplina não encontrada', 404);
    return true;
  }
}
