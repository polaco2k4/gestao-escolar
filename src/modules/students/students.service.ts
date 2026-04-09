import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class StudentsService {
  async list() {
    const students = await db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .select(
        's.id',
        's.user_id',
        's.student_number',
        'u.first_name',
        'u.last_name',
        'u.email',
        's.birth_date',
        's.gender'
      )
      .where('u.active', true)
      .orderBy('u.first_name', 'asc');

    return { students };
  }

  async getById(id: string) {
    const student = await db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .select('s.*', 'u.first_name', 'u.last_name', 'u.email', 'u.phone')
      .where('s.id', id)
      .first();

    if (!student) throw new AppError('Estudante não encontrado', 404);
    return student;
  }
}
