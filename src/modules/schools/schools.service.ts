import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthPayload } from '../../middleware/auth';
import bcrypt from 'bcryptjs';

export class SchoolsService {
  async list() {
    const schools = await db('schools')
      .select('*')
      .orderBy('name', 'asc');

    return { schools };
  }

  async getById(id: string) {
    const school = await db('schools')
      .where('id', id)
      .first();

    if (!school) throw new AppError('Escola não encontrada', 404);
    return school;
  }

  async create(data: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    // Dados do gestor (opcionais)
    gestor_email?: string;
    gestor_password?: string;
    gestor_first_name?: string;
    gestor_last_name?: string;
    gestor_phone?: string;
  }) {
    const existingSchool = await db('schools')
      .where('code', data.code)
      .first();

    if (existingSchool) {
      throw new AppError('Já existe uma escola com este código', 400);
    }

    // Verificar se email do gestor já existe
    if (data.gestor_email) {
      const existingUser = await db('users')
        .where('email', data.gestor_email)
        .first();
      
      if (existingUser) {
        throw new AppError('Já existe um utilizador com este email', 400);
      }
    }

    // Usar transação para criar escola e gestor
    const result = await db.transaction(async (trx) => {
      // Criar escola
      const [school] = await trx('schools')
        .insert({
          name: data.name,
          code: data.code,
          address: data.address,
          phone: data.phone,
          email: data.email,
          logo_url: data.logo_url,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      let gestor = null;

      // Criar gestor se os dados foram fornecidos
      if (data.gestor_email && data.gestor_password && data.gestor_first_name && data.gestor_last_name) {
        const password_hash = await bcrypt.hash(data.gestor_password, 12);
        
        [gestor] = await trx('users')
          .insert({
            email: data.gestor_email,
            password_hash,
            first_name: data.gestor_first_name,
            last_name: data.gestor_last_name,
            phone: data.gestor_phone,
            role: 'gestor',
            school_id: school.id,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning(['id', 'email', 'first_name', 'last_name', 'role', 'school_id']);
      }

      return { school, gestor };
    });

    return result;
  }

  async update(id: string, data: {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    active?: boolean;
  }) {
    if (data.code) {
      const existingSchool = await db('schools')
        .where('code', data.code)
        .whereNot('id', id)
        .first();

      if (existingSchool) {
        throw new AppError('Já existe uma escola com este código', 400);
      }
    }

    const [school] = await db('schools')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!school) throw new AppError('Escola não encontrada', 404);
    return school;
  }

  async delete(id: string) {
    const deleted = await db('schools')
      .where('id', id)
      .delete();

    if (!deleted) throw new AppError('Escola não encontrada', 404);
    return { message: 'Escola eliminada com sucesso' };
  }

  async getStats(id: string, user?: AuthPayload) {
    // Se for gestor, usar sua escola automaticamente
    const schoolId = user?.role === 'gestor' ? user.school_id : id;
    if (!schoolId) throw new AppError('Escola não especificada', 400);
    
    const school = await this.getById(schoolId);

    const [stats] = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'estudante') as total_students,
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'professor') as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE school_id = ?) as total_classes,
        (SELECT COUNT(*) FROM courses WHERE school_id = ? AND active = true) as total_courses
    `, [schoolId, schoolId, schoolId, schoolId]);

    return {
      school,
      stats: stats.rows[0]
    };
  }
}
