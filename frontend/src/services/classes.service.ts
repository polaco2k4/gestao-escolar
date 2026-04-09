import api from '../config/api';

export interface Class {
  id: string;
  name: string;
  year_level: number;
  section?: string;
}

class ClassesService {
  async list(): Promise<Class[]> {
    const response = await api.get('/api/classes');
    return response.data.data?.classes || [];
  }
}

export default new ClassesService();
