import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta, generateCode } from '../../utils/helpers';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class MatriculasService {
  async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
    const { offset } = paginate(page, limit);
    let query = db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('classes as c', 'c.id', 'e.class_id')
      .join('academic_years as ay', 'ay.id', 'e.academic_year_id');
    
    // Aplicar filtro de escola (usando alias 'e' para enrollments)
    query = applySchoolFilter(query, user, 'e');
    
    query = query.select(
        'e.*',
        'u.first_name', 'u.last_name', 'u.email',
        's.student_number',
        'c.name as class_name',
        'ay.name as academic_year_name'
      );

    // Remover filtro manual de school_id (já aplicado automaticamente)
    if (filters.academic_year_id) query.where('e.academic_year_id', filters.academic_year_id);
    if (filters.class_id) query.where('e.class_id', filters.class_id);
    if (filters.status) query.where('e.status', filters.status);
    if (filters.search) {
      query.where(function () {
        this.where('u.first_name', 'ilike', `%${filters.search}%`)
          .orWhere('u.last_name', 'ilike', `%${filters.search}%`)
          .orWhere('s.student_number', 'ilike', `%${filters.search}%`);
      });
    }

    let countQuery = db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id');
    
    // Aplicar filtro de escola na contagem (usando alias 'e' para enrollments)
    countQuery = applySchoolFilter(countQuery, user, 'e');
    
    const [{ count }] = await countQuery
      .where(function () {
        if (filters.status) this.where('e.status', filters.status);
      })
      .count('e.id as count');

    const enrollments = await query.orderBy('e.created_at', 'desc').limit(limit).offset(offset);
    const meta = buildPaginationMeta(Number(count), page, limit);

    return { enrollments, meta };
  }

  async getById(id: string, user?: AuthPayload) {
    const enrollment = await db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('classes as c', 'c.id', 'e.class_id')
      .join('academic_years as ay', 'ay.id', 'e.academic_year_id')
      .select(
        'e.*',
        'u.first_name', 'u.last_name', 'u.email', 'u.phone',
        's.student_number', 's.birth_date', 's.gender',
        'c.name as class_name',
        'ay.name as academic_year_name'
      )
      .where('e.id', id)
      .first();

    if (!enrollment) throw new AppError('Matrícula não encontrada', 404);
    
    // Validar acesso à escola
    if (user && !canAccessSchool(user, enrollment.school_id)) {
      throw new AppError('Sem permissão para acessar esta matrícula', 403);
    }
    
    return enrollment;
  }

  async create(data: any, user?: AuthPayload) {
    const existing = await db('enrollments')
      .where({ student_id: data.student_id, academic_year_id: data.academic_year_id })
      .first();

    if (existing) throw new AppError('Estudante já matriculado neste ano lectivo', 409);

    const classData = await db('classes').where('id', data.class_id).first();
    if (!classData) throw new AppError('Turma não encontrada', 404);

    const student = await db('students').where('id', data.student_id).first();
    if (!student) throw new AppError('Estudante não encontrado', 404);

    const enrollmentNumber = data.enrollment_number || generateCode('MAT', 8);

    const [enrollment] = await db('enrollments')
      .insert({ 
        ...data, 
        school_id: classData.school_id,
        enrollment_number: enrollmentNumber,
        enrollment_date: new Date(),
        status: 'active'
      })
      .returning('*');

    return enrollment;
  }

  async update(id: string, data: any, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
    const existing = await db('enrollments').where({ id }).first();
    if (!existing) throw new AppError('Matrícula não encontrada', 404);

    const [updated] = await db('enrollments')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');

    return updated;
  }

  async delete(id: string) {
    const existing = await db('enrollments').where({ id }).first();
    if (!existing) throw new AppError('Matrícula não encontrada', 404);

    await db('enrollments').where({ id }).delete();
  }

  async createTransfer(data: any) {
    const enrollment = await db('enrollments').where({ id: data.enrollment_id }).first();
    if (!enrollment) throw new AppError('Matrícula não encontrada', 404);

    const [transfer] = await db('transfers').insert(data).returning('*');

    await db('enrollments')
      .where({ id: data.enrollment_id })
      .update({ status: 'transferred', updated_at: new Date() });

    return transfer;
  }

  async listTransfers(page = 1, limit = 20) {
    const { offset } = paginate(page, limit);
    const transfers = await db('transfers as t')
      .join('enrollments as e', 'e.id', 't.enrollment_id')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .select('t.*', 'u.first_name', 'u.last_name', 's.student_number')
      .orderBy('t.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return transfers;
  }

  async approveTransfer(id: string, approvedBy: string, status: 'approved' | 'rejected') {
    const [transfer] = await db('transfers')
      .where({ id })
      .update({ status, approved_by: approvedBy, updated_at: new Date() })
      .returning('*');

    if (!transfer) throw new AppError('Transferência não encontrada', 404);
    return transfer;
  }
}
