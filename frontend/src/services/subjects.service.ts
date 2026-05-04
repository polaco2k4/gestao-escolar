import api from '../config/api';

export interface Subject {
  id: string;
  school_id: string;
  course_id?: string;
  course_name?: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  year_level: number;
  created_at: string;
  updated_at: string;
}

class SubjectsService {
  async list(filters?: { course_id?: string }): Promise<Subject[]> {
    const response = await api.get('/subjects', { params: filters });
    return response.data.data;
  }

  async getById(id: string): Promise<Subject> {
    const response = await api.get(`/subjects/${id}`);
    return response.data.data;
  }

  async create(data: Omit<Subject, 'id' | 'school_id' | 'course_id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const response = await api.post('/subjects', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Subject>): Promise<Subject> {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  }
}

export default new SubjectsService();
