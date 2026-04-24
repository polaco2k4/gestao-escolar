import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

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

  async create(data: any, school_id?: string) {
    const trx = await db.transaction();
    
    try {
      // Se school_id não foi fornecido, pegar a primeira escola disponível
      let finalSchoolId = school_id;
      
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
      const password_hash = await bcrypt.hash('professor123', 12);
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
        throw new AppError('Email já está em uso', 409);
      }
      throw error;
    }
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
