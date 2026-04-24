import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export class GuardiansService {
  async list() {
    const guardians = await db('guardians as g')
      .join('users as u', 'u.id', 'g.user_id')
      .join('schools as s', 's.id', 'g.school_id')
      .select(
        'g.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        's.name as school_name',
        's.code as school_code'
      )
      .orderBy('u.last_name', 'asc');
    return guardians;
  }

  async getById(id: string) {
    const guardian = await db('guardians as g')
      .join('users as u', 'u.id', 'g.user_id')
      .join('schools as s', 's.id', 'g.school_id')
      .select(
        'g.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        's.name as school_name',
        's.code as school_code'
      )
      .where('g.id', id)
      .first();

    if (!guardian) throw new AppError('Encarregado não encontrado', 404);
    return guardian;
  }

  async create(data: any, school_id?: string) {
    const trx = await db.transaction();
    
    try {
      // Se school_id não foi fornecido, pegar a primeira escola disponível
      let finalSchoolId = school_id || data.school_id;
      
      if (!finalSchoolId) {
        const firstSchool = await trx('schools').select('id').first();
        if (firstSchool) {
          finalSchoolId = firstSchool.id;
        } else {
          await trx.rollback();
          throw new AppError('Nenhuma escola encontrada no sistema', 400);
        }
      }
      
      // Verificar se email já existe
      const existingUser = await trx('users').where({ email: data.email }).first();
      if (existingUser) {
        await trx.rollback();
        throw new AppError('Email já está em uso', 409);
      }
      
      // Criar usuário primeiro
      const password_hash = await bcrypt.hash(data.password || 'encarregado123', 12);
      const [user] = await trx('users')
        .insert({
          email: data.email,
          password_hash,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          role: 'encarregado',
          school_id: finalSchoolId,
          active: true,
        })
        .returning('*');

      // Criar encarregado
      const guardianData = {
        user_id: user.id,
        school_id: finalSchoolId,
        occupation: data.occupation || null,
        address: data.address || null,
        relationship: data.relationship || 'Pai/Mãe',
      };

      const [guardian] = await trx('guardians').insert(guardianData).returning('*');
      
      await trx.commit();
      return { 
        ...guardian, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email,
        phone: user.phone,
        school_name: data.school_name || null
      };
    } catch (error: any) {
      await trx.rollback();
      if (error.code === '23505') {
        throw new AppError('Email já está em uso', 409);
      }
      throw error;
    }
  }

  async update(id: string, data: any) {
    const [guardian] = await db('guardians')
      .where({ id })
      .update({
        occupation: data.occupation,
        address: data.address,
        relationship: data.relationship,
      })
      .returning('*');

    if (!guardian) throw new AppError('Encarregado não encontrado', 404);
    return guardian;
  }

  async delete(id: string) {
    const deleted = await db('guardians')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Encarregado não encontrado', 404);
    return true;
  }
}
