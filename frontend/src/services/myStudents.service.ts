import api from '../config/api';

export interface Student {
  id: string;
  user_id: string;
  student_number: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  blood_type?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  guardian_name?: string;
}

export const myStudentsService = {
  async list(page = 1, limit = 20, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/students/my-students?${params}`);
    return response.data.data;
  }
};
