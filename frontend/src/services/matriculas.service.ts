import api from '../config/api';

export interface Enrollment {
  id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  enrollment_number: string;
  enrollment_date: string;
  status: 'active' | 'suspended' | 'transferred' | 'concluded' | 'cancelled';
  notes?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  student_number?: string;
  class_name?: string;
  academic_year_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentFormData {
  student_id: string;
  academic_year_id: string;
  class_id: string;
  enrollment_number?: string;
  notes?: string;
}

export interface EnrollmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  academic_year_id?: string;
  class_id?: string;
  status?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  meta: PaginationMeta;
}

class MatriculasService {
  async list(filters: EnrollmentFilters = {}): Promise<EnrollmentListResponse> {
    const response = await api.get('/matriculas', { params: filters });
    return response.data.data;
  }

  async getById(id: string): Promise<Enrollment> {
    const response = await api.get(`/matriculas/${id}`);
    return response.data.data;
  }

  async create(data: EnrollmentFormData): Promise<Enrollment> {
    const response = await api.post('/matriculas', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<EnrollmentFormData>): Promise<Enrollment> {
    const response = await api.put(`/matriculas/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/matriculas/${id}`);
  }
}

export default new MatriculasService();
