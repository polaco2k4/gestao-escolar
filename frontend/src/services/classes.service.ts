import api from '../config/api';

export interface Class {
  id: string;
  name: string;
  year_level: number;
  section?: string;
  max_students?: number;
  school_id: string;
  academic_year_id: string;
  course_id: string;
  class_director_id?: string;
  course_name?: string;
  academic_year_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClassFormData {
  school_id: string;
  academic_year_id: string;
  course_id: string;
  name: string;
  year_level: number;
  section?: string;
  max_students?: number;
  class_director_id?: string;
}

class ClassesService {
  async list(): Promise<Class[]> {
    const response = await api.get('/classes');
    return response.data.data?.classes || [];
  }

  async getById(id: string): Promise<Class> {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  }

  async getStudents(id: string): Promise<any> {
    const response = await api.get(`/classes/${id}/students`);
    return response.data.data;
  }

  async create(data: ClassFormData): Promise<Class> {
    const response = await api.post('/classes', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<ClassFormData>): Promise<Class> {
    const response = await api.put(`/classes/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/classes/${id}`);
  }
}

export default new ClassesService();
