import api from '../config/api';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  // Dados opcionais do gestor
  gestor_email?: string;
  gestor_password?: string;
  gestor_first_name?: string;
  gestor_last_name?: string;
  gestor_phone?: string;
}

export interface SchoolStats {
  school: School;
  stats: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_courses: number;
  };
}

class SchoolsService {
  async list(): Promise<School[]> {
    const response = await api.get('/schools');
    return response.data.data?.schools || [];
  }

  async getById(id: string): Promise<School> {
    const response = await api.get(`/schools/${id}`);
    return response.data.data;
  }

  async getStats(id: string): Promise<SchoolStats> {
    const response = await api.get(`/schools/${id}/stats`);
    return response.data.data;
  }

  async create(data: SchoolFormData): Promise<School> {
    const response = await api.post('/schools', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<SchoolFormData>): Promise<School> {
    const response = await api.put(`/schools/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/schools/${id}`);
  }

  async uploadLogo(id: string, file: File): Promise<School> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(`/schools/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
}

export default new SchoolsService();
