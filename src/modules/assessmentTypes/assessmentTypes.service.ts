import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class AssessmentTypesService {
  async list(user?: AuthPayload) {
    let query = db('assessment_types');
    query = applySchoolFilter(query, user);
    const types = await query
      .select('*')
      .orderBy('name', 'asc');
    return types;
  }

  async getById(id: string, user?: AuthPayload) {
    const type = await db('assessment_types')
      .where({ id })
      .first();
    
    if (!type) throw new AppError('Tipo de avaliação não encontrado', 404);
    
    if (user && !canAccessSchool(user, type.school_id)) {
      throw new AppError('Sem permissão para acessar este tipo de avaliação', 403);
    }
    
    return type;
  }

  async create(data: any, user?: AuthPayload) {
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    if (!schoolId) throw new AppError('Escola não especificada', 400);
    
    const insertData = { ...data, school_id: schoolId };
    const [type] = await db('assessment_types')
      .insert(insertData)
      .returning('*');
    return type;
  }

  async update(id: string, data: any, user?: AuthPayload) {
    await this.getById(id, user);
    
    const [type] = await db('assessment_types')
      .where({ id })
      .update(data)
      .returning('*');

    if (!type) throw new AppError('Tipo de avaliação não encontrado', 404);
    return type;
  }

  async delete(id: string, user?: AuthPayload) {
    await this.getById(id, user);
    
    const deleted = await db('assessment_types')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Tipo de avaliação não encontrado', 404);
    return true;
  }
}
