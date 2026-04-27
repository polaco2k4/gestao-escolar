import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';
import bcrypt from 'bcryptjs';

export class TeachersService {
  async list(user?: AuthPayload) {
    let query = db('teachers as t')
      .join('users as u', 'u.id', 't.user_id');
    
    // Aplicar filtro de escola (usando alias 't' para teachers)
    query = applySchoolFilter(query, user, 't');
    
    const teachers = await query
      .select('t.*', 'u.first_name', 'u.last_name', 'u.email')
      .orderBy('u.last_name', 'asc');
    return teachers;
  }

  async getById(id: string, user?: AuthPayload) {
    const teacher = await db('teachers as t')
      .join('users as u', 'u.id', 't.user_id')
      .select('t.*', 'u.first_name', 'u.last_name', 'u.email', 't.school_id')
      .where('t.id', id)
      .first();

    if (!teacher) throw new AppError('Professor não encontrado', 404);
    
    // Validar acesso à escola
    if (user && !canAccessSchool(user, teacher.school_id)) {
      throw new AppError('Sem permissão para acessar este professor', 403);
    }
    
    return teacher;
  }

  async create(data: any, authUser?: AuthPayload) {
    const trx = await db.transaction();
    
    try {
      // Admin pode escolher escola, outros usam sua própria escola
      let finalSchoolId = authUser?.role === 'admin' ? data.school_id : authUser?.school_id;
      
      if (!finalSchoolId) {
        const firstSchool = await trx('schools').select('id').first();
        if (firstSchool) {
          finalSchoolId = firstSchool.id;
        } else {
          await trx.rollback();
          throw new AppError('Nenhuma escola encontrada no sistema', 400);
        }
      }
      
      // Criar usuário primeiro
      // Usar senha fornecida ou padrão se não fornecida
      const passwordToHash = data.password || 'professor123';
      
      // Validar senha
      if (passwordToHash.length < 6) {
        await trx.rollback();
        throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);
      }
      
      const password_hash = await bcrypt.hash(passwordToHash, 12);
      const [user] = await trx('users')
        .insert({
          email: data.email,
          password_hash,
          first_name: data.first_name,
          last_name: data.last_name,
          role: 'professor',
          school_id: finalSchoolId,
          active: true,
        })
        .returning('*');

      // Criar professor
      const teacherData = {
        user_id: user.id,
        school_id: finalSchoolId,
        employee_number: data.employee_number,
        department: data.department,
        specialization: data.specialization,
        hire_date: data.hire_date,
      };

      const [teacher] = await trx('teachers').insert(teacherData).returning('*');
      
      await trx.commit();
      return { ...teacher, first_name: user.first_name, last_name: user.last_name, email: user.email };
    } catch (error: any) {
      await trx.rollback();
      if (error.code === '23505') {
        // Verificar qual campo causou o conflito
        if (error.constraint === 'users_email_key') {
          throw new AppError('Email já está em uso', 409);
        } else if (error.constraint === 'teachers_employee_number_school_unique') {
          throw new AppError('Número de funcionário já está em uso nesta escola', 409);
        } else {
          throw new AppError('Já existe um registo com estes dados', 409);
        }
      }
      throw error;
    }
  }

  async update(id: string, data: any, user?: AuthPayload) {
    // Validar acesso primeiro
    await this.getById(id, user);
    
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
