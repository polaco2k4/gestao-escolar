import api from '../config/api';

export interface Student {
  id: string;
  user_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: 'M' | 'F';
  nationality?: string;
  address?: string;
  blood_type?: string;
  medical_notes?: string;
  guardian_id?: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  student_number?: string;
  birth_date?: string;
  gender?: 'M' | 'F';
  nationality?: string;
  address?: string;
  blood_type?: string;
  medical_notes?: string;
  guardian_id?: string;
  password?: string;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  active?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentListResponse {
  students: Student[];
  meta: PaginationMeta;
}

class StudentsService {
  async list(filters: StudentFilters = {}): Promise<StudentListResponse> {
    const response = await api.get('/students', { params: filters });
    return response.data.data;
  }

  async getById(id: string): Promise<Student> {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  }

  async create(data: StudentFormData): Promise<Student> {
    const response = await api.post('/students', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<StudentFormData>): Promise<Student> {
    const response = await api.put(`/students/${id}`, data);
    return response.data.data;
  }

  async toggleActive(id: string): Promise<{ active: boolean }> {
    const response = await api.patch(`/students/${id}/toggle-active`);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  }
}

export default new StudentsService();
