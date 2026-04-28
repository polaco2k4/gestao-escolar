import db from '../../config/database';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

interface CustomReport {
  id?: string;
  school_id?: string;
  name: string;
  description?: string;
  report_type: string;
  filters?: any;
  columns?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  created_by?: string;
  is_public?: boolean;
}

export class RelatoriosService {
  // ==================== CRUD de Relatórios Personalizados ====================
  
  async createCustomReport(data: CustomReport, user: AuthPayload) {
    if (!user.school_id && user.role !== 'admin') {
      throw { message: 'Usuário não está associado a nenhuma escola', statusCode: 403 };
    }

    const reportData = {
      ...data,
      school_id: user.role === 'admin' && data.school_id ? data.school_id : user.school_id,
      created_by: user.id,
      filters: JSON.stringify(data.filters || {}),
      columns: JSON.stringify(data.columns || [])
    };

    const [report] = await db('custom_reports').insert(reportData).returning('*');
    return report;
  }

  async getAllCustomReports(user: AuthPayload) {
    let query = db('custom_reports as cr')
      .leftJoin('users as u', 'u.id', 'cr.created_by')
      .leftJoin('schools as s', 's.id', 'cr.school_id')
      .select(
        'cr.*',
        'u.first_name as creator_first_name',
        'u.last_name as creator_last_name',
        's.name as school_name'
      );

    query = applySchoolFilter(query, user, 'cr');

    const reports = await query.orderBy('cr.created_at', 'desc');
    
    return reports.map(report => ({
      ...report,
      filters: typeof report.filters === 'string' ? JSON.parse(report.filters) : report.filters,
      columns: typeof report.columns === 'string' ? JSON.parse(report.columns) : report.columns
    }));
  }

  async getCustomReportById(id: string, user: AuthPayload) {
    const report = await db('custom_reports')
      .where('id', id)
      .first();

    if (!report) {
      throw { message: 'Relatório não encontrado', statusCode: 404 };
    }

    if (!canAccessSchool(user, report.school_id)) {
      throw { message: 'Acesso negado a este relatório', statusCode: 403 };
    }

    return {
      ...report,
      filters: typeof report.filters === 'string' ? JSON.parse(report.filters) : report.filters,
      columns: typeof report.columns === 'string' ? JSON.parse(report.columns) : report.columns
    };
  }

  async updateCustomReport(id: string, data: Partial<CustomReport>, user: AuthPayload) {
    const existing = await db('custom_reports').where('id', id).first();

    if (!existing) {
      throw { message: 'Relatório não encontrado', statusCode: 404 };
    }

    if (!canAccessSchool(user, existing.school_id)) {
      throw { message: 'Acesso negado a este relatório', statusCode: 403 };
    }

    if (existing.created_by !== user.id && user.role !== 'admin') {
      throw { message: 'Apenas o criador ou admin pode editar este relatório', statusCode: 403 };
    }

    const updateData: any = { ...data };
    if (data.filters) updateData.filters = JSON.stringify(data.filters);
    if (data.columns) updateData.columns = JSON.stringify(data.columns);

    const [updated] = await db('custom_reports')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return {
      ...updated,
      filters: typeof updated.filters === 'string' ? JSON.parse(updated.filters) : updated.filters,
      columns: typeof updated.columns === 'string' ? JSON.parse(updated.columns) : updated.columns
    };
  }

  async deleteCustomReport(id: string, user: AuthPayload) {
    const existing = await db('custom_reports').where('id', id).first();

    if (!existing) {
      throw { message: 'Relatório não encontrado', statusCode: 404 };
    }

    if (!canAccessSchool(user, existing.school_id)) {
      throw { message: 'Acesso negado a este relatório', statusCode: 403 };
    }

    if (existing.created_by !== user.id && user.role !== 'admin') {
      throw { message: 'Apenas o criador ou admin pode excluir este relatório', statusCode: 403 };
    }

    await db('custom_reports').where('id', id).delete();
    return { message: 'Relatório excluído com sucesso' };
  }

  async executeCustomReport(id: string, additionalFilters: any = {}, user: AuthPayload) {
    const report = await this.getCustomReportById(id, user);
    
    const startTime = Date.now();
    let data;

    switch (report.report_type) {
      case 'students':
        data = await this.getStudentsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'attendance':
        data = await this.getAttendanceReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'grades':
        data = await this.getGradesReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'financial':
        data = await this.getFinancialReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'enrollments':
        data = await this.getEnrollmentsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'teachers':
        data = await this.getTeachersReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'classes':
        data = await this.getClassesReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'subjects':
        data = await this.getSubjectsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'courses':
        data = await this.getCoursesReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'academic_years':
        data = await this.getAcademicYearsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'rooms':
        data = await this.getRoomsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'schedules':
        data = await this.getSchedulesReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'guardians':
        data = await this.getGuardiansReport({ ...report.filters, ...additionalFilters }, user);
        break;
      case 'documents':
        data = await this.getDocumentsReport({ ...report.filters, ...additionalFilters }, user);
        break;
      default:
        throw { message: 'Tipo de relatório não suportado', statusCode: 400 };
    }

    const executionTime = Date.now() - startTime;

    await db('report_executions').insert({
      report_id: id,
      executed_by: user.id,
      row_count: data.length,
      execution_time_ms: executionTime,
      filters_used: JSON.stringify({ ...report.filters, ...additionalFilters })
    });

    return {
      report_info: report,
      data,
      metadata: {
        row_count: data.length,
        execution_time_ms: executionTime,
        executed_at: new Date().toISOString()
      }
    };
  }

  // ==================== Relatórios Predefinidos ====================
  
  async getStudentsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .join('enrollments as e', 'e.student_id', 's.id')
      .join('classes as c', 'c.id', 'e.class_id');
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      's.student_number as numero_aluno',
      'u.email',
      db.raw("TO_CHAR(s.birth_date, 'DD/MM/YYYY') as data_nascimento"),
      db.raw("CASE s.gender WHEN 'M' THEN 'Masculino' WHEN 'F' THEN 'Feminino' ELSE s.gender END as genero"),
      'c.name as turma',
      'e.status as estado_matricula'
    );
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
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      's.student_number as numero_aluno',
      'c.name as turma',
      'sub.name as disciplina',
      db.raw("TO_CHAR(ar.date, 'DD/MM/YYYY') as data"),
      'ar.status as estado'
    );

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
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      's.student_number as numero_aluno',
      'c.name as turma',
      'sub.name as disciplina',
      'a.name as avaliacao',
      'at.name as tipo',
      'g.score as nota',
      'at.max_score as nota_maxima',
      'a.trimester as trimestre'
    );

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
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      's.student_number as numero_aluno',
      'ft.name as tipo_propina',
      'sf.amount as valor',
      db.raw("TO_CHAR(sf.due_date, 'DD/MM/YYYY') as data_vencimento"),
      'sf.status as estado'
    )
      .sum('p.amount as pago')
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
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      's.student_number as numero_aluno',
      'c.name as turma',
      'ay.name as ano_lectivo',
      db.raw("TO_CHAR(e.enrollment_date, 'DD/MM/YYYY') as data_matricula"),
      'e.status as estado'
    );
    if (filters.academic_year_id) query.where('e.academic_year_id', filters.academic_year_id);
    if (filters.class_id) query.where('e.class_id', filters.class_id);
    if (filters.status) query.where('e.status', filters.status);

    return query.orderBy('e.enrollment_date', 'desc');
  }

  async getTeachersReport(filters: any = {}, user?: AuthPayload) {
    let query = db('teachers as t')
      .join('users as u', 'u.id', 't.user_id');

    query = applySchoolFilter(query, user, 't');

    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      'u.email',
      't.employee_number as numero_funcionario',
      't.department as departamento',
      't.specialization as especializacao',
      db.raw("TO_CHAR(t.hire_date, 'DD/MM/YYYY') as data_contratacao"),
      db.raw("CASE WHEN u.active THEN 'Activo' ELSE 'Inactivo' END as estado")
    );

    return query.orderBy('u.last_name');
  }

  async getClassesReport(filters: any = {}, user?: AuthPayload) {
    let query = db('classes as c')
      .leftJoin('academic_years as ay', 'ay.id', 'c.academic_year_id')
      .leftJoin('courses as co', 'co.id', 'c.course_id');

    query = applySchoolFilter(query, user, 'c');

    query = query.select(
      'c.name as nome',
      'c.year_level as ano',
      'c.section as secao',
      'c.max_students as max_alunos',
      'ay.name as ano_lectivo',
      'co.name as curso'
    );

    if (filters.academic_year_id) query.where('c.academic_year_id', filters.academic_year_id);
    if (filters.course_id) query.where('c.course_id', filters.course_id);

    return query.orderBy('c.name');
  }

  async getSubjectsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('subjects as sub')
      .leftJoin('courses as co', 'co.id', 'sub.course_id');

    query = applySchoolFilter(query, user, 'sub');

    query = query.select(
      'sub.name as nome',
      'sub.code as codigo',
      'co.name as curso',
      'sub.credits as creditos',
      'sub.year_level as ano'
    );

    if (filters.course_id) query.where('sub.course_id', filters.course_id);

    return query.orderBy('sub.name');
  }

  async getCoursesReport(filters: any = {}, user?: AuthPayload) {
    let query = db('courses as co');

    query = applySchoolFilter(query, user, 'co');

    query = query.select(
      'co.name as nome',
      'co.code as codigo',
      'co.level as nivel',
      'co.duration_years as duracao_anos',
      db.raw("CASE WHEN co.active THEN 'Activo' ELSE 'Inactivo' END as estado")
    );

    return query.orderBy('co.name');
  }

  async getAcademicYearsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('academic_years as ay');

    query = applySchoolFilter(query, user, 'ay');

    query = query.select(
      'ay.name as nome',
      db.raw("TO_CHAR(ay.start_date, 'DD/MM/YYYY') as data_inicio"),
      db.raw("TO_CHAR(ay.end_date, 'DD/MM/YYYY') as data_fim"),
      db.raw("CASE WHEN ay.is_current THEN 'Sim' ELSE 'Não' END as ano_corrente")
    );

    return query.orderBy('ay.start_date', 'desc');
  }

  async getRoomsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('rooms as r');

    query = applySchoolFilter(query, user, 'r');

    query = query.select(
      'r.name as nome',
      'r.building as edificio',
      'r.capacity as capacidade',
      'r.type as tipo',
      db.raw("CASE WHEN r.active THEN 'Activa' ELSE 'Inactiva' END as estado")
    );

    if (filters.type) query.where('r.type', filters.type);

    return query.orderBy('r.name');
  }

  async getSchedulesReport(filters: any = {}, user?: AuthPayload) {
    let query = db('schedules as sch')
      .join('subjects as sub', 'sub.id', 'sch.subject_id')
      .join('classes as c', 'c.id', 'sch.class_id')
      .join('teachers as t', 't.id', 'sch.teacher_id')
      .join('users as u', 'u.id', 't.user_id')
      .leftJoin('rooms as r', 'r.id', 'sch.room_id');

    query = applySchoolFilter(query, user, 'sch');

    query = query.select(
      'sub.name as disciplina',
      'c.name as turma',
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as professor"),
      'r.name as sala',
      'sch.day_of_week as dia_semana',
      db.raw("TO_CHAR(sch.start_time, 'HH24:MI') as hora_inicio"),
      db.raw("TO_CHAR(sch.end_time, 'HH24:MI') as hora_fim")
    );

    if (filters.class_id) query.where('sch.class_id', filters.class_id);
    if (filters.teacher_id) query.where('sch.teacher_id', filters.teacher_id);

    return query.orderBy(['sch.day_of_week', 'sch.start_time']);
  }

  async getGuardiansReport(filters: any = {}, user?: AuthPayload) {
    let query = db('guardians as g')
      .join('users as u', 'u.id', 'g.user_id')
      .leftJoin('students as s', 's.guardian_id', 'g.id')
      .leftJoin('users as us', 'us.id', 's.user_id');

    query = applySchoolFilter(query, user, 'g');

    query = query.select(
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as nome"),
      'u.email',
      'g.relationship as parentesco',
      'g.occupation as ocupacao',
      db.raw("CONCAT(us.first_name, ' ', us.last_name) as educando")
    );

    return query.orderBy('u.last_name');
  }

  async getDocumentsReport(filters: any = {}, user?: AuthPayload) {
    let query = db('documents as d')
      .leftJoin('users as u', 'u.id', 'd.requested_by');

    query = applySchoolFilter(query, user, 'd');

    query = query.select(
      'd.title as titulo',
      'd.type as tipo',
      db.raw("CONCAT(u.first_name, ' ', u.last_name) as solicitado_por"),
      db.raw("TO_CHAR(d.created_at, 'DD/MM/YYYY') as data_criacao"),
      'd.status as estado'
    );

    if (filters.type) query.where('d.type', filters.type);

    return query.orderBy('d.created_at', 'desc');
  }
}
