import api from '../config/api';

export interface Course {
  id: string;
  school_id: string;
  name: string;
  code: string;
  level?: string;
  duration_years?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  school_id: string;
  name: string;
  code: string;
  level?: string;
  duration_years?: number;
}

class CoursesService {
  async list(filters?: { school_id?: string }): Promise<Course[]> {
    const response = await api.get('/courses', { params: filters });
    return response.data.data?.courses || [];
  }

  async getById(id: string): Promise<Course> {
    const response = await api.get(`/api/courses/${id}`);
    return response.data.data;
  }

  async create(data: CourseFormData): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<CourseFormData>): Promise<Course> {
    const response = await api.put(`/api/courses/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/courses/${id}`);
  }
}

export default new CoursesService();
