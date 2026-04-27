import api from '../config/api';

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'gestor' | 'professor' | 'estudante' | 'encarregado';
  phone?: string;
  school_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    school_id?: string;
  };
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', data);
    return response.data.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', data);
    return response.data.data;
  },

  async getProfile(token: string) {
    const response = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
