import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';
import { AuthPayload } from '../../middleware/auth';

export class HorariosService {
  // --- Schedules ---
  async listSchedules(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
    const { offset } = paginate(page, limit);
    let query = db('schedules as s')
      .join('classes as c', 'c.id', 's.class_id')
      .join('subjects as sub', 'sub.id', 's.subject_id')
      .join('teachers as t', 't.id', 's.teacher_id')
      .join('users as u', 'u.id', 't.user_id')
      .leftJoin('rooms as r', 'r.id', 's.room_id');
    
    query = applySchoolFilter(query, user, 's');
    
    query = query.select('s.*', 'c.name as class_name', 'sub.name as subject_name', 'u.first_name as teacher_first_name', 'u.last_name as teacher_last_name', 'r.name as room_name');

    if (filters.class_id) query.where('s.class_id', filters.class_id);
    if (filters.teacher_id) query.where('s.teacher_id', filters.teacher_id);
    if (filters.day_of_week) query.where('s.day_of_week', filters.day_of_week);

    let countQuery = db('schedules as s');
    countQuery = applySchoolFilter(countQuery, user, 's');
    const [{ count }] = await countQuery.count('s.id as count');
    const schedules = await query.orderBy('s.day_of_week').orderBy('s.start_time').limit(limit).offset(offset);
    return { schedules, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getScheduleById(id: string, user?: AuthPayload) {
    const schedule = await db('schedules as s')
      .join('classes as c', 'c.id', 's.class_id')
      .join('subjects as sub', 'sub.id', 's.subject_id')
      .join('teachers as t', 't.id', 's.teacher_id')
      .join('users as u', 'u.id', 't.user_id')
      .leftJoin('rooms as r', 'r.id', 's.room_id')
      .select('s.*', 'c.name as class_name', 'sub.name as subject_name', 'u.first_name as teacher_first_name', 'u.last_name as teacher_last_name', 'r.name as room_name')
      .where('s.id', id)
      .first();
    if (!schedule) throw new AppError('Horário não encontrado', 404);
    
    if (user && !canAccessSchool(user, schedule.school_id)) {
      throw new AppError('Sem permissão', 403);
    }
    
    return schedule;
  }

  async createSchedule(data: any, user?: AuthPayload) {
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    if (!schoolId) throw new AppError('Escola não especificada', 400);
    
    if (data.room_id) {
      const conflict = await db('schedules')
        .where({ room_id: data.room_id, day_of_week: data.day_of_week })
        .where('start_time', '<', data.end_time)
        .where('end_time', '>', data.start_time)
        .first();
      if (conflict) throw new AppError('Conflito de horário na sala indicada', 409);
    }

    const [schedule] = await db('schedules').insert({ ...data, school_id: schoolId }).returning('*');
    return schedule;
  }

  async updateSchedule(id: string, data: any, user?: AuthPayload) {
    await this.getScheduleById(id, user);
    
    const [updated] = await db('schedules').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Horário não encontrado', 404);
    return updated;
  }

  async deleteSchedule(id: string, user?: AuthPayload) {
    await this.getScheduleById(id, user);
    
    const deleted = await db('schedules').where({ id }).delete();
    if (!deleted) throw new AppError('Horário não encontrado', 404);
  }

  async getScheduleByClass(classId: string) {
    return db('schedules as s')
      .join('subjects as sub', 'sub.id', 's.subject_id')
      .join('teachers as t', 't.id', 's.teacher_id')
      .join('users as u', 'u.id', 't.user_id')
      .leftJoin('rooms as r', 'r.id', 's.room_id')
      .select('s.*', 'sub.name as subject_name', 'u.first_name as teacher_first_name', 'u.last_name as teacher_last_name', 'r.name as room_name')
      .where('s.class_id', classId)
      .orderBy('s.day_of_week')
      .orderBy('s.start_time');
  }

  async getScheduleByTeacher(teacherId: string) {
    return db('schedules as s')
      .join('classes as c', 'c.id', 's.class_id')
      .join('subjects as sub', 'sub.id', 's.subject_id')
      .leftJoin('rooms as r', 'r.id', 's.room_id')
      .select('s.*', 'c.name as class_name', 'sub.name as subject_name', 'r.name as room_name')
      .where('s.teacher_id', teacherId)
      .orderBy('s.day_of_week')
      .orderBy('s.start_time');
  }

  // --- Classes ---
  async listClasses(filters: any = {}) {
    const query = db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .join('academic_years as ay', 'ay.id', 'c.academic_year_id')
      .leftJoin('teachers as t', 't.id', 'c.class_director_id')
      .leftJoin('users as u', 'u.id', 't.user_id')
      .select('c.*', 'co.name as course_name', 'ay.name as academic_year_name', 'u.first_name as director_first_name', 'u.last_name as director_last_name');

    if (filters.school_id) query.where('c.school_id', filters.school_id);
    if (filters.academic_year_id) query.where('c.academic_year_id', filters.academic_year_id);
    if (filters.course_id) query.where('c.course_id', filters.course_id);

    return query.orderBy('c.year_level').orderBy('c.name');
  }

  async getClassById(id: string) {
    const cls = await db('classes as c')
      .join('courses as co', 'co.id', 'c.course_id')
      .select('c.*', 'co.name as course_name')
      .where('c.id', id)
      .first();
    if (!cls) throw new AppError('Turma não encontrada', 404);

    const students = await db('enrollments as e')
      .join('students as s', 's.id', 'e.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .select('s.id', 's.student_number', 'u.first_name', 'u.last_name')
      .where('e.class_id', id)
      .where('e.status', 'active');

    return { ...cls, students };
  }

  async createClass(data: any) {
    const [cls] = await db('classes').insert(data).returning('*');
    return cls;
  }

  async updateClass(id: string, data: any) {
    const [updated] = await db('classes').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Turma não encontrada', 404);
    return updated;
  }

  // --- Subjects ---
  async listSubjects(filters: any = {}) {
    const query = db('subjects');
    if (filters.school_id) query.where('school_id', filters.school_id);
    if (filters.course_id) query.where('course_id', filters.course_id);
    return query.orderBy('name');
  }

  async createSubject(data: any) {
    const [subject] = await db('subjects').insert(data).returning('*');
    return subject;
  }

  async updateSubject(id: string, data: any) {
    const [updated] = await db('subjects').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Disciplina não encontrada', 404);
    return updated;
  }

  // --- Rooms ---
  async listRooms(filters: any = {}, user?: AuthPayload) {
    let query = db('rooms');
    query = applySchoolFilter(query, user);
    if (filters.active !== undefined) query.where('active', filters.active);
    return query.orderBy('name');
  }

  async createRoom(data: any, user?: AuthPayload) {
    const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
    if (!schoolId) throw new AppError('Escola não especificada', 400);
    
    const [room] = await db('rooms').insert({ ...data, school_id: schoolId }).returning('*');
    return room;
  }

  async updateRoom(id: string, data: any, user?: AuthPayload) {
    const existing = await db('rooms').where({ id }).first();
    if (!existing) throw new AppError('Sala não encontrada', 404);
    
    if (user && !canAccessSchool(user, existing.school_id)) {
      throw new AppError('Sem permissão', 403);
    }
    
    const [updated] = await db('rooms').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Sala não encontrada', 404);
    return updated;
  }

  async deleteRoom(id: string, user?: AuthPayload) {
    const existing = await db('rooms').where({ id }).first();
    if (!existing) throw new AppError('Sala não encontrada', 404);
    
    if (user && !canAccessSchool(user, existing.school_id)) {
      throw new AppError('Sem permissão', 403);
    }
    
    const deleted = await db('rooms').where({ id }).delete();
    if (!deleted) throw new AppError('Sala não encontrada', 404);
  }
}
