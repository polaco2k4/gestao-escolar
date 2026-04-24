import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';
import {
  CreateAssessmentDTO,
  UpdateAssessmentDTO,
  AssessmentFilters,
  SaveGradeDTO,
  CreateGradeSheetDTO,
  GradeSheetFilters
} from './avaliacoes.types';

export class AvaliacoesService {
  async list(page = 1, limit = 20, filters: AssessmentFilters = {}) {
    const { offset } = paginate(page, limit);
    const query = db('assessments as a')
      .join('subjects as sub', 'sub.id', 'a.subject_id')
      .join('classes as c', 'c.id', 'a.class_id')
      .join('teachers as t', 't.id', 'a.teacher_id')
      .join('users as u', 'u.id', 't.user_id')
      .join('assessment_types as at', 'at.id', 'a.assessment_type_id')
      .select('a.*', 'sub.name as subject_name', 'c.name as class_name', 'u.first_name as teacher_first_name', 'u.last_name as teacher_last_name', 'at.name as type_name');

    if (filters.class_id) query.where('a.class_id', filters.class_id);
    if (filters.subject_id) query.where('a.subject_id', filters.subject_id);
    if (filters.trimester) query.where('a.trimester', filters.trimester);
    if (filters.teacher_id) query.where('a.teacher_id', filters.teacher_id);

    const countQuery = db('assessments as a').count('a.id as count');
    if (filters.class_id) countQuery.where('a.class_id', filters.class_id);
    if (filters.subject_id) countQuery.where('a.subject_id', filters.subject_id);
    if (filters.trimester) countQuery.where('a.trimester', filters.trimester);
    if (filters.teacher_id) countQuery.where('a.teacher_id', filters.teacher_id);
    const [{ count }] = await countQuery;

    const assessments = await query.orderBy('a.date', 'desc').limit(limit).offset(offset);
    return { assessments, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getById(id: string) {
    const assessment = await db('assessments as a')
      .join('subjects as sub', 'sub.id', 'a.subject_id')
      .join('classes as c', 'c.id', 'a.class_id')
      .join('assessment_types as at', 'at.id', 'a.assessment_type_id')
      .select('a.*', 'sub.name as subject_name', 'c.name as class_name', 'at.name as type_name', 'at.max_score')
      .where('a.id', id)
      .first();

    if (!assessment) throw new AppError('Avaliação não encontrada', 404);
    return assessment;
  }

  async create(data: CreateAssessmentDTO) {
    if (!data.school_id) throw new AppError('ID da escola é obrigatório', 400);
    if (!data.academic_year_id) throw new AppError('ID do ano académico é obrigatório', 400);
    if (!data.class_id) throw new AppError('ID da turma é obrigatório', 400);
    if (!data.subject_id) throw new AppError('ID da disciplina é obrigatório', 400);
    if (!data.teacher_id) throw new AppError('ID do professor é obrigatório', 400);
    if (!data.assessment_type_id) throw new AppError('ID do tipo de avaliação é obrigatório', 400);
    if (!data.name) throw new AppError('Nome da avaliação é obrigatório', 400);

    const [assessment] = await db('assessments').insert(data).returning('*');
    return assessment;
  }

  async update(id: string, data: UpdateAssessmentDTO) {
    const [updated] = await db('assessments').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Avaliação não encontrada', 404);
    return updated;
  }

  async delete(id: string) {
    const deleted = await db('assessments').where({ id }).delete();
    if (!deleted) throw new AppError('Avaliação não encontrada', 404);
  }

  async listGrades(assessmentId: string) {
    const assessment = await db('assessments as a')
      .select('a.class_id', 'a.academic_year_id')
      .where('a.id', assessmentId)
      .first();

    if (!assessment) throw new AppError('Avaliação não encontrada', 404);

    const students = await db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .leftJoin('grades as g', function() {
        this.on('g.student_id', 's.id')
          .andOn('g.assessment_id', db.raw('?', [assessmentId]));
      })
      .select(
        's.id as student_id',
        'u.first_name',
        'u.last_name',
        's.student_number',
        'g.id',
        'g.assessment_id',
        'g.score',
        'g.remarks',
        'g.created_at',
        'g.updated_at'
      )
      .where('e.class_id', assessment.class_id)
      .where('e.academic_year_id', assessment.academic_year_id)
      .where('e.status', 'active')
      .orderBy('u.last_name');

    return students;
  }

  async saveGrades(assessmentId: string, grades: SaveGradeDTO[]) {
    const assessment = await db('assessments as a')
      .join('assessment_types as at', 'at.id', 'a.assessment_type_id')
      .select('a.*', 'at.max_score')
      .where('a.id', assessmentId)
      .first();

    if (!assessment) throw new AppError('Avaliação não encontrada', 404);
    if (!grades || grades.length === 0) throw new AppError('Nenhuma nota fornecida', 400);

    return db.transaction(async (trx) => {
      const results = [];
      for (const grade of grades) {
        if (!grade.student_id) throw new AppError('ID do estudante é obrigatório', 400);
        if (grade.score < 0 || grade.score > assessment.max_score) {
          throw new AppError(`Nota deve estar entre 0 e ${assessment.max_score}`, 400);
        }

        const existing = await trx('grades').where({ assessment_id: assessmentId, student_id: grade.student_id }).first();

        if (existing) {
          const [updated] = await trx('grades')
            .where({ id: existing.id })
            .update({ score: grade.score, remarks: grade.remarks, updated_at: new Date() })
            .returning('*');
          results.push(updated);
        } else {
          const [created] = await trx('grades')
            .insert({ assessment_id: assessmentId, student_id: grade.student_id, score: grade.score, remarks: grade.remarks })
            .returning('*');
          results.push(created);
        }
      }
      return results;
    });
  }

  async listGradeSheets(filters: GradeSheetFilters = {}) {
    const query = db('grade_sheets as gs')
      .join('classes as c', 'c.id', 'gs.class_id')
      .join('subjects as sub', 'sub.id', 'gs.subject_id')
      .select('gs.*', 'c.name as class_name', 'sub.name as subject_name');

    if (filters.class_id) query.where('gs.class_id', filters.class_id);
    if (filters.status) query.where('gs.status', filters.status);

    return query.orderBy('gs.created_at', 'desc');
  }

  async createGradeSheet(data: CreateGradeSheetDTO) {
    if (!data.school_id) throw new AppError('ID da escola é obrigatório', 400);
    if (!data.academic_year_id) throw new AppError('ID do ano académico é obrigatório', 400);
    if (!data.class_id) throw new AppError('ID da turma é obrigatório', 400);
    if (!data.subject_id) throw new AppError('ID da disciplina é obrigatório', 400);
    if (!data.trimester) throw new AppError('Trimestre é obrigatório', 400);

    const [sheet] = await db('grade_sheets').insert(data).returning('*');
    return sheet;
  }

  async submitGradeSheet(id: string, teacherId: string) {
    const [sheet] = await db('grade_sheets')
      .where({ id })
      .update({ status: 'submitted', submitted_by: teacherId, submitted_at: new Date(), updated_at: new Date() })
      .returning('*');
    if (!sheet) throw new AppError('Pauta não encontrada', 404);
    return sheet;
  }

  async approveGradeSheet(id: string, approvedBy: string) {
    const [sheet] = await db('grade_sheets')
      .where({ id })
      .update({ status: 'approved', approved_by: approvedBy, approved_at: new Date(), updated_at: new Date() })
      .returning('*');
    if (!sheet) throw new AppError('Pauta não encontrada', 404);
    return sheet;
  }
}
