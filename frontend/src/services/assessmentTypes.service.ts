import api from '../config/api';

export interface AssessmentType {
  id: string;
  school_id: string;
  name: string;
  weight: number;
  max_score: number;
  created_at: string;
}

class AssessmentTypesService {
  async list(): Promise<AssessmentType[]> {
    const response = await api.get('/assessment-types');
    return response.data.data;
  }

  async getById(id: string): Promise<AssessmentType> {
    const response = await api.get(`/assessment-types/${id}`);
    return response.data.data;
  }

  async create(data: Omit<AssessmentType, 'id' | 'school_id' | 'created_at'>): Promise<AssessmentType> {
    const response = await api.post('/assessment-types', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<AssessmentType>): Promise<AssessmentType> {
    const response = await api.put(`/assessment-types/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/assessment-types/${id}`);
  }
}

export default new AssessmentTypesService();
