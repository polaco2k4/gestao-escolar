import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class ClassesService {
  async list() {
    const classes = await db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .join('academic_years as ay', 'ay.id', 'c.academic_year_id')
      .select(
        'c.id',
        'c.name',
        'c.year_level',
        'c.section',
        'c.max_students',
        'co.name as course_name',
        'ay.name as academic_year_name',
        'ay.is_current'
      )
      .orderBy('c.year_level', 'asc')
      .orderBy('c.name', 'asc');

    return { classes };
  }

  async getById(id: string) {
    const classData = await db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .join('academic_years as ay', 'ay.id', 'c.academic_year_id')
      .select('c.*', 'co.name as course_name', 'ay.name as academic_year_name')
      .where('c.id', id)
      .first();

    if (!classData) throw new AppError('Turma não encontrada', 404);
    return classData;
  }
}
