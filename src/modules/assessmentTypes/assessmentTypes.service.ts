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

  async create(data: any, school_id?: string) {
    // Se school_id não foi fornecido, pegar a primeira escola disponível
    let finalSchoolId = school_id;
    
    if (!finalSchoolId) {
      const firstSchool = await db('schools').select('id').first();
      if (firstSchool) {
        finalSchoolId = firstSchool.id;
      } else {
        throw new AppError('Nenhuma escola encontrada no sistema', 400);
      }
    }
    
    const insertData = { ...data, school_id: finalSchoolId };
    const [type] = await db('assessment_types')
      .insert(insertData)
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
