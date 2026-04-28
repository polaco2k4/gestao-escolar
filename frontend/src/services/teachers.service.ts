import api from '../config/api';

export interface Teacher {
  id: string;
  user_id: string;
  school_id: string;
  employee_number?: string;
  department?: string;
  specialization?: string;
  hire_date?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

class TeachersService {
  async list(): Promise<Teacher[]> {
    const response = await api.get('/teachers');
    return response.data.data;
  }

  async getById(id: string): Promise<Teacher> {
    const response = await api.get(`/api/teachers/${id}`);
    return response.data.data;
  }

  async create(data: Omit<Teacher, 'id' | 'user_id' | 'school_id' | 'created_at' | 'updated_at'>): Promise<Teacher> {
    const response = await api.post('/teachers', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<Teacher>): Promise<Teacher> {
    const response = await api.put(`/api/teachers/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/teachers/${id}`);
  }
}

export default new TeachersService();
