import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class AssessmentTypesService {
  async list() {
    const types = await db('assessment_types')
      .select('*')
      .orderBy('name', 'asc');
    return types;
  }

  async getById(id: string) {
    const type = await db('assessment_types')
      .where({ id })
      .first();
    
    if (!type) throw new AppError('Tipo de avaliação não encontrado', 404);
    return type;
  }

  async create(data: any) {
    const [type] = await db('assessment_types')
      .insert(data)
      .returning('*');
    return type;
  }

  async update(id: string, data: any) {
    const [type] = await db('assessment_types')
      .where({ id })
      .update(data)
      .returning('*');

    if (!type) throw new AppError('Tipo de avaliação não encontrado', 404);
    return type;
  }

  async delete(id: string) {
    const deleted = await db('assessment_types')
      .where({ id })
      .del();

    if (!deleted) throw new AppError('Tipo de avaliação não encontrado', 404);
    return true;
  }
}
