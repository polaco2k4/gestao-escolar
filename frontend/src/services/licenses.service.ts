import api from '../config/api';

export interface LicensePlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  max_students?: number;
  max_teachers?: number;
  max_classes?: number;
  max_storage_mb?: number;
  features: any;
  price_monthly: number;
  active: boolean;
}

export interface License {
  id: string;
  school_id: string;
  plan_id: string;
  status: 'active' | 'suspended' | 'expired' | 'trial';
  start_date: string;
  end_date?: string;
  trial_ends_at?: string;
  auto_renew: boolean;
  notes?: string;
  school_name?: string;
  school_code?: string;
  plan_name?: string;
  plan_display_name?: string;
  max_students?: number;
  max_teachers?: number;
  max_classes?: number;
}

export interface LicenseUsage {
  current_students: number;
  current_teachers: number;
  current_classes: number;
  storage_used_mb: number;
  max_students?: number;
  max_teachers?: number;
  max_classes?: number;
  max_storage_mb?: number;
  students_percentage: number;
  teachers_percentage: number;
  classes_percentage: number;
  storage_percentage: number;
}

export interface GlobalStats {
  summary: {
    total_schools: number;
    total_students: number;
    total_teachers: number;
    total_classes: number;
    active_licenses: number;
    trial_licenses: number;
    expired_licenses: number;
    suspended_licenses: number;
  };
  licenses_by_plan: Array<{
    plan_name: string;
    count: number;
  }>;
  expiring_soon: Array<{
    id: string;
    school_name: string;
    plan_name: string;
    end_date?: string;
    trial_ends_at?: string;
    status: string;
  }>;
}

const licensesService = {
  // Planos
  listPlans: async () => {
    const response = await api.get('/licenses/plans');
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await api.get(`/api/licenses/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: Partial<LicensePlan>) => {
    const response = await api.post('/licenses/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<LicensePlan>) => {
    const response = await api.put(`/api/licenses/plans/${id}`, data);
    return response.data;
  },

  // Licenças
  listLicenses: async () => {
    const response = await api.get('/licenses');
    return response.data;
  },

  getLicenseById: async (id: string) => {
    const response = await api.get(`/api/licenses/${id}`);
    return response.data;
  },

  getLicenseBySchoolId: async (schoolId: string) => {
    const response = await api.get(`/api/licenses/school/${schoolId}`);
    return response.data;
  },

  createLicense: async (data: {
    school_id: string;
    plan_id: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    trial_ends_at?: string;
    auto_renew?: boolean;
    notes?: string;
  }) => {
    const response = await api.post('/licenses', data);
    return response.data;
  },

  updateLicense: async (id: string, data: Partial<License>) => {
    const response = await api.put(`/api/licenses/${id}`, data);
    return response.data;
  },

  deleteLicense: async (id: string) => {
    const response = await api.delete(`/api/licenses/${id}`);
    return response.data;
  },

  // Verificação e estatísticas
  checkLimits: async (schoolId: string) => {
    const response = await api.get(`/api/licenses/check/${schoolId}`);
    return response.data;
  },

  getUsage: async (schoolId: string) => {
    const response = await api.get(`/api/licenses/usage/${schoolId}`);
    return response.data;
  },

  getGlobalStats: async (): Promise<{ data: GlobalStats }> => {
    const response = await api.get('/licenses/stats/global');
    return response.data;
  },
};

export default licensesService;
