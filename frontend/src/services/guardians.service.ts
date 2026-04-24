import api from '../config/api';

export interface Guardian {
  id: string;
  user_id: string;
  school_id: string;
  occupation?: string;
  address?: string;
  relationship: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  school_name?: string;
  school_code?: string;
}

export interface CreateGuardianData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  school_id: string;
  occupation?: string;
  address?: string;
  relationship: string;
}

export interface UpdateGuardianData {
  occupation?: string;
  address?: string;
  relationship?: string;
}

export const guardiansService = {
  async list(): Promise<Guardian[]> {
    const response = await api.get('/api/guardians');
    return response.data.data;
  },

  async getById(id: string): Promise<Guardian> {
    const response = await api.get(`/api/guardians/${id}`);
    return response.data.data;
  },

  async create(data: CreateGuardianData): Promise<Guardian> {
    const response = await api.post('/api/guardians', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateGuardianData): Promise<Guardian> {
    const response = await api.put(`/api/guardians/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/guardians/${id}`);
  }
};
