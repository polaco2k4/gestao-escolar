import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class AcademicYearsService {
  async list() {
    const academicYears = await db('academic_years')
      .select('*')
      .orderBy('is_current', 'desc')
      .orderBy('start_date', 'desc');

    return { academicYears };
  }

  async getById(id: string) {
    const academicYear = await db('academic_years')
      .where('id', id)
      .first();

    if (!academicYear) throw new AppError('Ano lectivo não encontrado', 404);
    return academicYear;
  }

  async getCurrent() {
    const academicYear = await db('academic_years')
      .where('is_current', true)
      .first();

    if (!academicYear) throw new AppError('Nenhum ano lectivo activo encontrado', 404);
    return academicYear;
  }
}
