import api from '../config/api';

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

class AcademicYearsService {
  async list(): Promise<AcademicYear[]> {
    const response = await api.get('/api/academic-years');
    return response.data.data?.academicYears || [];
  }
}

export default new AcademicYearsService();
