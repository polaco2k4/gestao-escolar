import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class ClassesService {
  async list(user?: AuthPayload) {
    let query = db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .join('academic_years as ay', 'ay.id', 'c.academic_year_id');
    
    // Aplicar filtro de escola (usando alias 'c' para classes)
    query = applySchoolFilter(query, user, 'c');
    
    const classes = await query.select(
        'c.id',
        'c.name',
        'c.year_level',
        'c.section',
        'c.max_students',
        'co.name as course_name',
        'ay.name as academic_year_name',
        'ay.is_current'
      )
      .orderBy('c.year_level', 'asc')
      .orderBy('c.name', 'asc');

    return { classes };
  }

  async getById(id: string, user?: AuthPayload) {
    const classData = await db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .join('academic_years as ay', 'ay.id', 'c.academic_year_id')
      .select('c.*', 'co.name as course_name', 'ay.name as academic_year_name')
      .where('c.id', id)
      .first();

    if (!classData) throw new AppError('Turma não encontrada', 404);
    
    // Validar acesso à escola
    if (user && !canAccessSchool(user, classData.school_id)) {
      throw new AppError('Sem permissão para acessar esta turma', 403);
    }
    
    return classData;
  }

  async create(data: {
    school_id?: string;
    academic_year_id: string;
    course_id: string;
    name: string;
    year_level: number;
    section?: string;
    max_students?: number;
    class_director_id?: string;
  }, user?: AuthPayload) {
    // Admin pode escolher escola, outros usam sua própria escola
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    
    if (!schoolId) {
      throw new AppError('Escola não especificada', 400);
    }
    const course = await db('courses').where('id', data.course_id).first();
    if (!course) throw new AppError('Curso não encontrado', 404);

    const academicYear = await db('academic_years').where('id', data.academic_year_id).first();
    if (!academicYear) throw new AppError('Ano académico não encontrado', 404);

    const [classData] = await db('classes')
      .insert({
        ...data,
        school_id: schoolId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return classData;
  }

  async update(id: string, data: {
    name?: string;
    year_level?: number;
    section?: string;
    max_students?: number;
    class_director_id?: string;
  }) {
    const [classData] = await db('classes')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!classData) throw new AppError('Turma não encontrada', 404);
    return classData;
  }

  async delete(id: string) {
    const enrollments = await db('enrollments')
      .where('class_id', id)
      .where('status', 'active')
      .count('* as count')
      .first();

    if (enrollments && parseInt(enrollments.count as string) > 0) {
      throw new AppError('Não é possível eliminar turma com matrículas ativas', 400);
    }

    const deleted = await db('classes')
      .where('id', id)
      .delete();

    if (!deleted) throw new AppError('Turma não encontrada', 404);
    return { message: 'Turma eliminada com sucesso' };
  }

  async getStudents(id: string) {
    const classData = await this.getById(id);

    const students = await db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .select(
        's.id',
        's.student_number',
        'u.first_name',
        'u.last_name',
        'u.email',
        'e.status',
        'e.enrollment_date'
      )
      .where('e.class_id', id)
      .orderBy('u.first_name', 'asc');

    return {
      class: classData,
      students
    };
  }
}
