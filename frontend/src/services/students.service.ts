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
    const response = await api.get('/api/students', { params: filters });
    return response.data.data;
  }

  async getById(id: string): Promise<Student> {
    const response = await api.get(`/api/students/${id}`);
    return response.data.data;
  }

  async create(data: StudentFormData): Promise<Student> {
    const response = await api.post('/api/students', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<StudentFormData>): Promise<Student> {
    const response = await api.put(`/api/students/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/students/${id}`);
  }
}

export default new StudentsService();
