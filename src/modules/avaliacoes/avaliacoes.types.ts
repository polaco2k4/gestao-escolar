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
  date?: Date;
  trimester?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssessmentDTO {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  assessment_type_id: string;
  name: string;
  description?: string;
  date?: Date;
  trimester?: number;
}

export interface UpdateAssessmentDTO {
  name?: string;
  description?: string;
  date?: Date;
  trimester?: number;
  assessment_type_id?: string;
}

export interface AssessmentFilters {
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
  created_at: Date;
  updated_at: Date;
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
  submitted_by?: string;
  approved_by?: string;
  submitted_at?: Date;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGradeSheetDTO {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  trimester: number;
}

export interface GradeSheetFilters {
  class_id?: string;
  status?: string;
}
