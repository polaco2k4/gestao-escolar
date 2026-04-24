import api from '../config/api';

export interface Schedule {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_name?: string;
  subject_name?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  room_name?: string;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  course_id?: string;
  academic_year_id: string;
  name: string;
  code: string;
  capacity?: number;
  course_name?: string;
  academic_year_name?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  course_id?: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  year_level: number;
  created_at: string;
}

export interface Room {
  id: string;
  school_id: string;
  name: string;
  building?: string;
  capacity?: number;
  type?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

class HorariosService {
  async listSchedules(filters?: { class_id?: string; teacher_id?: string }): Promise<Schedule[]> {
    const response = await api.get('/api/horarios/schedules', { params: filters });
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.schedules || []);
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await api.get(`/api/horarios/schedules/${id}`);
    return response.data.data;
  }

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post('/api/horarios/schedules', data);
    return response.data.data;
  }

  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.put(`/api/horarios/schedules/${id}`, data);
    return response.data.data;
  }

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`/api/horarios/schedules/${id}`);
  }

  async listClasses(filters?: { academic_year_id?: string }): Promise<Class[]> {
    const response = await api.get('/api/horarios/classes', { params: filters });
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.classes || []);
  }

  async getClassById(id: string): Promise<Class> {
    const response = await api.get(`/api/horarios/classes/${id}`);
    return response.data.data;
  }

  async createClass(data: Partial<Class>): Promise<Class> {
    const response = await api.post('/api/horarios/classes', data);
    return response.data.data;
  }

  async updateClass(id: string, data: Partial<Class>): Promise<Class> {
    const response = await api.put(`/api/horarios/classes/${id}`, data);
    return response.data.data;
  }

  async listSubjects(): Promise<Subject[]> {
    const response = await api.get('/api/horarios/subjects');
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.subjects || []);
  }

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    const response = await api.post('/api/horarios/subjects', data);
    return response.data.data;
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    const response = await api.put(`/api/horarios/subjects/${id}`, data);
    return response.data.data;
  }

  async listRooms(): Promise<Room[]> {
    const response = await api.get('/api/horarios/rooms');
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.rooms || []);
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    const response = await api.post('/api/horarios/rooms', data);
    return response.data.data;
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    const response = await api.put(`/api/horarios/rooms/${id}`, data);
    return response.data.data;
  }

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/api/horarios/rooms/${id}`);
  }

  async getScheduleByClass(classId: string): Promise<Schedule[]> {
    const response = await api.get(`/api/horarios/by-class/${classId}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  async getScheduleByTeacher(teacherId: string): Promise<Schedule[]> {
    const response = await api.get(`/api/horarios/by-teacher/${teacherId}`);
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }
}

export default new HorariosService();
