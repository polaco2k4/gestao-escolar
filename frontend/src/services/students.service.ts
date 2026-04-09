import api from '../config/api';

export interface Student {
  id: string;
  user_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
}

class StudentsService {
  async list(): Promise<Student[]> {
    const response = await api.get('/api/students');
    return response.data.data?.students || [];
  }
}

export default new StudentsService();
