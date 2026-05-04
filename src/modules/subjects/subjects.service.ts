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

    if (user?.role === 'encarregado') {
      const guardian = await db('guardians').where({ user_id: user.id }).select('id').first();
      if (guardian) {
        const students = await db('students').where({ guardian_id: guardian.id }).select('id');
        const studentIds = students.map((s: any) => s.id);
        const enrollments = await db('enrollments as e')
          .join('classes as cl', 'cl.id', 'e.class_id')
          .whereIn('e.student_id', studentIds)
          .where('e.status', 'active')
          .select('cl.course_id', 'cl.year_level')
          .distinct();

        const courseIds = enrollments.map((e: any) => e.course_id).filter(Boolean);
        const yearLevels = enrollments.map((e: any) => e.year_level).filter(Boolean);

        if (courseIds.length || yearLevels.length) {
          query = query.where((builder: any) => {
            if (courseIds.length) builder.whereIn('s.course_id', courseIds);
            builder.orWhereNull('s.course_id');
          });
          if (yearLevels.length) query = query.whereIn('s.year_level', yearLevels);
        }
      }
    } else if (user?.role === 'estudante') {
      // Obter o curso da matrícula activa do aluno
      const student = await db('students').where({ user_id: user.id }).select('id').first();
      if (student) {
        const enrollment = await db('enrollments as e')
          .join('classes as cl', 'cl.id', 'e.class_id')
          .where({ 'e.student_id': student.id, 'e.status': 'active' })
          .select('cl.course_id', 'cl.year_level')
          .first();

        const courseId = enrollment?.course_id ?? null;
        const yearLevel = enrollment?.year_level ?? null;

        query = query.where((builder: any) => {
          if (courseId) builder.where('s.course_id', courseId);
          builder.orWhereNull('s.course_id');
        });

        if (yearLevel) {
          query = query.where('s.year_level', yearLevel);
        }
      } else {
        // Aluno sem registo: só mostra transversais
        query = query.whereNull('s.course_id');
      }
    } else if (filters?.course_id) {
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
