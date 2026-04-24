import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';

export class AssiduidadeService {
  async list(page = 1, limit = 20, filters: any = {}) {
    const { offset } = paginate(page, limit);
    const query = db('attendance_records as ar')
      .join('students as s', 's.id', 'ar.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .select('ar.*', 'u.first_name', 'u.last_name', 's.student_number', 'sub.name as subject_name');

    if (filters.class_id) {
      query.join('classes as c', 'c.id', 'sch.class_id').where('sch.class_id', filters.class_id);
    }
    if (filters.date) query.where('ar.date', filters.date);
    if (filters.status) query.where('ar.status', filters.status);
    if (filters.student_id) query.where('ar.student_id', filters.student_id);

    const [{ count }] = await db('attendance_records').count('id as count');
    const records = await query.orderBy('ar.date', 'desc').limit(limit).offset(offset);
    return { records, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getById(id: string) {
    const record = await db('attendance_records as ar')
      .join('students as s', 's.id', 'ar.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .leftJoin('classes as c', 'c.id', 'sch.class_id')
      .select('ar.*', 'u.first_name', 'u.last_name', 's.student_number', 'sub.name as subject_name', 'c.name as class_name')
      .where('ar.id', id)
      .first();
    if (!record) throw new AppError('Registo de presença não encontrado', 404);
    return record;
  }

  async getByStudent(studentId: string, filters: any = {}) {
    const query = db('attendance_records as ar')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .select('ar.*', 'sub.name as subject_name')
      .where('ar.student_id', studentId);

    if (filters.date_from) query.where('ar.date', '>=', filters.date_from);
    if (filters.date_to) query.where('ar.date', '<=', filters.date_to);

    return query.orderBy('ar.date', 'desc');
  }

  async getByClassAndDate(classId: string, date: string) {
    return db('attendance_records as ar')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .join('students as s', 's.id', 'ar.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .select('ar.*', 'u.first_name', 'u.last_name', 's.student_number', 'sub.name as subject_name')
      .where('sch.class_id', classId)
      .where('ar.date', date)
      .orderBy('u.last_name');
  }

  async record(data: any) {
    const [record] = await db('attendance_records').insert(data).returning('*');
    return record;
  }

  async bulkRecord(records: Array<{ schedule_id: string; student_id: string; date: string; status: string; recorded_by: string; school_id: string }>) {
    return db.transaction(async (trx: any) => {
      const results = [];
      for (const record of records) {
        const existing = await trx('attendance_records')
          .where({ schedule_id: record.schedule_id, student_id: record.student_id, date: record.date })
          .first();

        if (existing) {
          const [updated] = await trx('attendance_records')
            .where({ id: existing.id })
            .update({ status: record.status, updated_at: new Date() })
            .returning('*');
          results.push(updated);
        } else {
          const [created] = await trx('attendance_records').insert(record).returning('*');
          results.push(created);
        }
      }
      return results;
    });
  }

  async update(id: string, data: any) {
    const [updated] = await db('attendance_records').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Registo de presença não encontrado', 404);
    return updated;
  }

  async delete(id: string) {
    const deleted = await db('attendance_records').where({ id }).delete();
    if (!deleted) throw new AppError('Registo de presença não encontrado', 404);
    return { message: 'Registo de presença eliminado com sucesso' };
  }

  async submitJustification(data: any) {
    const attendance = await db('attendance_records').where({ id: data.attendance_id }).first();
    if (!attendance) throw new AppError('Registo de presença não encontrado', 404);

    const [justification] = await db('attendance_justifications').insert(data).returning('*');
    return justification;
  }

  async listJustifications(filters: any = {}) {
    const query = db('attendance_justifications as aj')
      .join('attendance_records as ar', 'ar.id', 'aj.attendance_id')
      .join('students as s', 's.id', 'ar.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .select('aj.*', 'u.first_name', 'u.last_name', 's.student_number', 'ar.date', 'ar.status as attendance_status');

    if (filters.status) query.where('aj.status', filters.status);
    return query.orderBy('aj.created_at', 'desc');
  }

  async reviewJustification(id: string, reviewedBy: string, status: 'approved' | 'rejected') {
    const [justification] = await db('attendance_justifications')
      .where({ id })
      .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date(), updated_at: new Date() })
      .returning('*');

    if (!justification) throw new AppError('Justificação não encontrada', 404);

    if (status === 'approved') {
      await db('attendance_records')
        .where({ id: justification.attendance_id })
        .update({ status: 'justified', updated_at: new Date() });
    }

    return justification;
  }

  async deleteJustification(id: string) {
    const deleted = await db('attendance_justifications').where({ id }).delete();
    if (!deleted) throw new AppError('Justificação não encontrada', 404);
    return { message: 'Justificação eliminada com sucesso' };
  }

  async getStudentSummary(studentId: string, academicYearId?: string) {
    const query = db('attendance_records as ar')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .where('ar.student_id', studentId);

    if (academicYearId) query.where('sch.academic_year_id', academicYearId);

    const stats = await query.select('ar.status').count('ar.id as count').groupBy('ar.status');

    const summary: any = { present: 0, absent: 0, late: 0, justified: 0, total: 0 };
    stats.forEach((s: any) => {
      summary[s.status] = Number(s.count);
      summary.total += Number(s.count);
    });
    summary.attendance_rate = summary.total > 0 ? ((summary.present + summary.justified) / summary.total * 100).toFixed(1) : '0';

    return summary;
  }

  async getClassSummary(classId: string, date?: string) {
    const query = db('attendance_records as ar')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .where('sch.class_id', classId);

    if (date) query.where('ar.date', date);

    const stats = await query.select('ar.status').count('ar.id as count').groupBy('ar.status');

    const summary: any = { present: 0, absent: 0, late: 0, justified: 0, total: 0 };
    stats.forEach((s: any) => {
      summary[s.status] = Number(s.count);
      summary.total += Number(s.count);
    });

    return summary;
  }
}
