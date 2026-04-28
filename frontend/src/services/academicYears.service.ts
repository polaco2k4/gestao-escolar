import api from '../config/api';

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

class AcademicYearsService {
  async list(): Promise<AcademicYear[]> {
    const response = await api.get('/academic-years');
    return response.data.data?.academicYears || [];
  }

  async getById(id: string): Promise<AcademicYear> {
    const response = await api.get(`/academic-years/${id}`);
    return response.data.data;
  }

  async create(data: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await api.post('/academic-years', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<AcademicYear>): Promise<AcademicYear> {
    const response = await api.put(`/academic-years/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/academic-years/${id}`);
  }
}

export default new AcademicYearsService();
