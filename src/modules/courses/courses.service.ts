import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class CoursesService {
  async list(user?: AuthPayload) {
    let query = db('courses')
      .select('*')
      .where('active', true);
    
    // Aplicar filtro de escola
    query = applySchoolFilter(query, user);
    
    const courses = await query.orderBy('name', 'asc');
    return { courses };
  }

  async getById(id: string, user?: AuthPayload) {
    const course = await db('courses')
      .where('id', id)
      .first();

    if (!course) throw new AppError('Curso não encontrado', 404);
    
    // Validar acesso à escola
    if (user && !canAccessSchool(user, course.school_id)) {
      throw new AppError('Sem permissão para acessar este curso', 403);
    }
    
    return course;
  }

  async create(data: {
    school_id?: string;
    name: string;
    code: string;
    level?: string;
    duration_years?: number;
  }, user?: AuthPayload) {
    // Admin pode escolher escola, outros usam sua própria escola
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    
    if (!schoolId) {
      throw new AppError('Escola não especificada', 400);
    }
    const existingCourse = await db('courses')
      .where('code', data.code)
      .where('school_id', schoolId)
      .first();

    if (existingCourse) {
      throw new AppError('Já existe um curso com este código nesta escola', 400);
    }

    const [course] = await db('courses')
      .insert({
        ...data,
        school_id: schoolId,
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
  }, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
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

  async delete(id: string, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
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
