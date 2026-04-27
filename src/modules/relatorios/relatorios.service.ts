import db from '../../config/database';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class RelatoriosService {
  async getStudentsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .join('enrollments as e', 'e.student_id', 's.id')
      .join('classes as c', 'c.id', 'e.class_id');
    
    query = applySchoolFilter(query, user);
    
    query = query.select('s.id', 's.student_number', 'u.first_name', 'u.last_name', 'u.email', 's.birth_date', 's.gender', 'c.name as class_name', 'e.status as enrollment_status');
    if (filters.class_id) query.where('e.class_id', filters.class_id);
    if (filters.status) query.where('e.status', filters.status);

    return query.orderBy('u.last_name');
  }

  async getAttendanceReport(filters: any = {}, user?: AuthPayload) {
    let query = db('attendance_records as ar')
      .join('students as s', 's.id', 'ar.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('schedules as sch', 'sch.id', 'ar.schedule_id')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .join('classes as c', 'c.id', 'sch.class_id');
    
    query = applySchoolFilter(query, user);
    
    query = query.select('s.student_number', 'u.first_name', 'u.last_name', 'c.name as class_name', 'sub.name as subject_name', 'ar.date', 'ar.status');

    if (filters.class_id) query.where('sch.class_id', filters.class_id);
    if (filters.date_from) query.where('ar.date', '>=', filters.date_from);
    if (filters.date_to) query.where('ar.date', '<=', filters.date_to);
    if (filters.status) query.where('ar.status', filters.status);

    return query.orderBy('ar.date', 'desc');
  }

  async getGradesReport(filters: any = {}, user?: AuthPayload) {
    let query = db('grades as g')
      .join('assessments as a', 'a.id', 'g.assessment_id')
      .join('students as s', 's.id', 'g.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('subjects as sub', 'sub.id', 'a.subject_id')
      .join('classes as c', 'c.id', 'a.class_id')
      .join('assessment_types as at', 'at.id', 'a.assessment_type_id');
    
    query = applySchoolFilter(query, user);
    
    query = query.select('s.student_number', 'u.first_name', 'u.last_name', 'c.name as class_name', 'sub.name as subject_name', 'a.name as assessment_name', 'at.name as type_name', 'g.score', 'at.max_score', 'a.trimester');

    if (filters.class_id) query.where('a.class_id', filters.class_id);
    if (filters.subject_id) query.where('a.subject_id', filters.subject_id);
    if (filters.trimester) query.where('a.trimester', filters.trimester);
    if (filters.academic_year_id) query.where('a.academic_year_id', filters.academic_year_id);

    return query.orderBy('u.last_name');
  }

  async getFinancialReport(filters: any = {}, user?: AuthPayload) {
    let query = db('student_fees as sf')
      .join('students as s', 's.id', 'sf.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .leftJoin('payments as p', 'p.student_fee_id', 'sf.id');
    
    query = applySchoolFilter(query, user);
    
    query = query.select('s.student_number', 'u.first_name', 'u.last_name', 'ft.name as fee_type', 'sf.amount', 'sf.due_date', 'sf.status')
      .sum('p.amount as paid')
      .groupBy('sf.id', 's.student_number', 'u.first_name', 'u.last_name', 'ft.name', 'sf.amount', 'sf.due_date', 'sf.status');

    if (filters.academic_year_id) query.where('sf.academic_year_id', filters.academic_year_id);
    if (filters.status) query.where('sf.status', filters.status);

    return query.orderBy('sf.due_date', 'desc');
  }

  async getEnrollmentsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('classes as c', 'c.id', 'e.class_id')
      .join('academic_years as ay', 'ay.id', 'e.academic_year_id');
    
    query = applySchoolFilter(query, user);
    
    query = query.select('s.student_number', 'u.first_name', 'u.last_name', 'c.name as class_name', 'ay.name as academic_year', 'e.enrollment_date', 'e.status');
    if (filters.academic_year_id) query.where('e.academic_year_id', filters.academic_year_id);
    if (filters.class_id) query.where('e.class_id', filters.class_id);
    if (filters.status) query.where('e.status', filters.status);

    return query.orderBy('e.enrollment_date', 'desc');
  }
}
