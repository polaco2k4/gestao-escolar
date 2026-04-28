import api from '../config/api';

export interface Assessment {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  assessment_type_id: string;
  name: string;
  description?: string;
  date?: string;
  trimester?: number;
  subject_name?: string;
  class_name?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  type_name?: string;
  max_score?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentFormData {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  assessment_type_id: string;
  name: string;
  description?: string;
  date?: string;
  trimester?: number;
}

export interface AssessmentFilters {
  page?: number;
  limit?: number;
  class_id?: string;
  subject_id?: string;
  trimester?: number;
  teacher_id?: string;
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  remarks?: string;
  first_name?: string;
  last_name?: string;
  student_number?: string;
  created_at: string;
  updated_at: string;
}

export interface SaveGradeDTO {
  student_id: string;
  score: number;
  remarks?: string;
}

export interface GradeSheet {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  trimester: number;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  class_name?: string;
  subject_name?: string;
  submitted_by?: string;
  approved_by?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGradeSheetDTO {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  trimester: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssessmentListResponse {
  assessments: Assessment[];
  meta: PaginationMeta;
}

class AvaliacoesService {
  async list(filters: AssessmentFilters = {}): Promise<AssessmentListResponse> {
    const response = await api.get('/avaliacoes', { params: filters });
    return response.data.data;
  }

  async listMyAssessments(filters: AssessmentFilters = {}): Promise<AssessmentListResponse> {
    const response = await api.get('/avaliacoes/my-assessments', { params: filters });
    return response.data.data;
  }

  async getById(id: string): Promise<Assessment> {
    const response = await api.get(`/api/avaliacoes/${id}`);
    return response.data.data;
  }

  async create(data: AssessmentFormData): Promise<Assessment> {
    const response = await api.post('/avaliacoes', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<AssessmentFormData>): Promise<Assessment> {
    const response = await api.put(`/api/avaliacoes/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/avaliacoes/${id}`);
  }

  async listGrades(assessmentId: string): Promise<Grade[]> {
    const response = await api.get(`/api/avaliacoes/${assessmentId}/grades`);
    return response.data.data;
  }

  async listGradesByGuardian(assessmentId: string): Promise<Grade[]> {
    const response = await api.get(`/api/avaliacoes/${assessmentId}/grades/my-students`);
    return response.data.data;
  }

  async saveGrades(assessmentId: string, grades: SaveGradeDTO[]): Promise<Grade[]> {
    const response = await api.post(`/api/avaliacoes/${assessmentId}/grades`, { grades });
    return response.data.data;
  }

  async listGradeSheets(filters: { class_id?: string; status?: string } = {}): Promise<GradeSheet[]> {
    const response = await api.get('/avaliacoes/sheets/list', { params: filters });
    return response.data.data;
  }

  async createGradeSheet(data: CreateGradeSheetDTO): Promise<GradeSheet> {
    const response = await api.post('/avaliacoes/sheets', data);
    return response.data.data;
  }

  async submitGradeSheet(id: string): Promise<GradeSheet> {
    const response = await api.put(`/api/avaliacoes/sheets/${id}/submit`);
    return response.data.data;
  }

  async approveGradeSheet(id: string): Promise<GradeSheet> {
    const response = await api.put(`/api/avaliacoes/sheets/${id}/approve`);
    return response.data.data;
  }
}

export default new AvaliacoesService();
