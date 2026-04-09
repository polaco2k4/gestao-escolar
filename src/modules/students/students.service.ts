import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta, generateCode } from '../../utils/helpers';
import bcrypt from 'bcryptjs';

export class StudentsService {
  async list(page = 1, limit = 20, filters: any = {}) {
    const { offset } = paginate(page, limit);
    const query = db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .leftJoin('guardians as g', 'g.id', 's.guardian_id')
      .leftJoin('users as gu', 'gu.id', 'g.user_id')
      .select(
        's.id',
        's.user_id',
        's.student_number',
        's.birth_date',
        's.gender',
        's.nationality',
        's.address',
        's.blood_type',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.active',
        'u.avatar_url',
        's.created_at',
        's.updated_at',
        db.raw('CONCAT(gu.first_name, \' \', gu.last_name) as guardian_name')
      );

    if (filters.search) {
      query.where(function () {
        this.where('u.first_name', 'ilike', `%${filters.search}%`)
          .orWhere('u.last_name', 'ilike', `%${filters.search}%`)
          .orWhere('s.student_number', 'ilike', `%${filters.search}%`)
          .orWhere('u.email', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.gender) query.where('s.gender', filters.gender);
    if (filters.active !== undefined) query.where('u.active', filters.active);

    const [{ count }] = await db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .where(function () {
        if (filters.search) {
          this.where('u.first_name', 'ilike', `%${filters.search}%`)
            .orWhere('u.last_name', 'ilike', `%${filters.search}%`)
            .orWhere('s.student_number', 'ilike', `%${filters.search}%`);
        }
      })
      .count('s.id as count');

    const students = await query.orderBy('u.first_name', 'asc').limit(limit).offset(offset);
    const meta = buildPaginationMeta(Number(count), page, limit);

    return { students, meta };
  }

  async getById(id: string) {
    const student = await db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .leftJoin('guardians as g', 'g.id', 's.guardian_id')
      .leftJoin('users as gu', 'gu.id', 'g.user_id')
      .select(
        's.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.active',
        'u.avatar_url',
        'u.school_id',
        db.raw('CONCAT(gu.first_name, \' \', gu.last_name) as guardian_name'),
        'gu.email as guardian_email',
        'gu.phone as guardian_phone',
        'g.relationship as guardian_relationship'
      )
      .where('s.id', id)
      .first();

    if (!student) throw new AppError('Estudante não encontrado', 404);
    return student;
  }

  async create(data: any) {
    const trx = await db.transaction();

    try {
      let schoolId = data.school_id;
      
      if (!schoolId && data.user_id) {
        const loggedUser = await trx('users').where('id', data.user_id).first();
        if (loggedUser) {
          schoolId = loggedUser.school_id;
        } else {
          throw new AppError(`Usuário com ID ${data.user_id} não encontrado`, 400);
        }
      }

      if (!schoolId) {
        const firstSchool = await trx('schools').where('active', true).first();
        if (firstSchool) {
          schoolId = firstSchool.id;
        } else {
          throw new AppError('Nenhuma escola encontrada no sistema. Por favor, crie uma escola primeiro.', 400);
        }
      }

      const existingEmail = await trx('users').where('email', data.email).first();
      if (existingEmail) throw new AppError('Email já está em uso', 409);

      const studentNumber = data.student_number || generateCode('EST', 6);
      const existingNumber = await trx('students').where('student_number', studentNumber).first();
      if (existingNumber) throw new AppError('Número de estudante já existe', 409);

      const passwordHash = await bcrypt.hash(data.password || 'estudante123', 10);

      const [user] = await trx('users')
        .insert({
          school_id: schoolId,
          email: data.email,
          password_hash: passwordHash,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          role: 'estudante',
          active: true,
        })
        .returning('*');

      const [student] = await trx('students')
        .insert({
          user_id: user.id,
          school_id: schoolId,
          student_number: studentNumber,
          birth_date: data.birth_date || null,
          gender: data.gender || null,
          nationality: data.nationality || null,
          address: data.address || null,
          blood_type: data.blood_type || null,
          medical_notes: data.medical_notes || null,
          guardian_id: data.guardian_id || null,
        })
        .returning('*');

      await trx.commit();
      return { ...student, ...user };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async update(id: string, data: any) {
    const trx = await db.transaction();

    try {
      const existing = await trx('students').where({ id }).first();
      if (!existing) throw new AppError('Estudante não encontrado', 404);

      if (data.email) {
        const emailExists = await trx('users')
          .where('email', data.email)
          .whereNot('id', existing.user_id)
          .first();
        if (emailExists) throw new AppError('Email já está em uso', 409);
      }

      const userUpdates: any = {};
      if (data.first_name) userUpdates.first_name = data.first_name;
      if (data.last_name) userUpdates.last_name = data.last_name;
      if (data.email) userUpdates.email = data.email;
      if (data.phone) userUpdates.phone = data.phone;
      if (data.active !== undefined) userUpdates.active = data.active;

      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date();
        await trx('users').where('id', existing.user_id).update(userUpdates);
      }

      const studentUpdates: any = {};
      if (data.birth_date) studentUpdates.birth_date = data.birth_date;
      if (data.gender) studentUpdates.gender = data.gender;
      if (data.nationality) studentUpdates.nationality = data.nationality;
      if (data.address) studentUpdates.address = data.address;
      if (data.blood_type) studentUpdates.blood_type = data.blood_type;
      if (data.medical_notes !== undefined) studentUpdates.medical_notes = data.medical_notes;
      if (data.guardian_id !== undefined) studentUpdates.guardian_id = data.guardian_id;

      if (Object.keys(studentUpdates).length > 0) {
        studentUpdates.updated_at = new Date();
        await trx('students').where('id', id).update(studentUpdates);
      }

      await trx.commit();

      return await this.getById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async delete(id: string) {
    const trx = await db.transaction();

    try {
      const student = await trx('students').where({ id }).first();
      if (!student) throw new AppError('Estudante não encontrado', 404);

      const hasEnrollments = await trx('enrollments').where('student_id', id).first();
      if (hasEnrollments) {
        throw new AppError('Não é possível eliminar estudante com matrículas associadas', 400);
      }

      await trx('students').where({ id }).delete();
      await trx('users').where('id', student.user_id).delete();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
