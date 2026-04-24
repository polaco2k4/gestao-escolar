import api from '../config/api';

export interface FeeType {
  id: string;
  school_id: string;
  name: string;
  amount: number;
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  description?: string;
  created_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_type_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  fee_type_name?: string;
  student_first_name?: string;
  student_last_name?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  student_fee_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  student_first_name?: string;
  student_last_name?: string;
  fee_name?: string;
  created_at: string;
}

export interface FinancialSummary {
  total_expected: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  payment_rate: number;
}

class FinanceiroService {
  async listFeeTypes(): Promise<FeeType[]> {
    const response = await api.get('/api/financeiro/fee-types');
    return response.data.data || [];
  }

  async createFeeType(data: Partial<FeeType>): Promise<FeeType> {
    const response = await api.post('/api/financeiro/fee-types', data);
    return response.data.data;
  }

  async updateFeeType(id: string, data: Partial<FeeType>): Promise<FeeType> {
    const response = await api.put(`/api/financeiro/fee-types/${id}`, data);
    return response.data.data;
  }

  async listStudentFees(filters?: { student_id?: string; status?: string }): Promise<StudentFee[]> {
    const response = await api.get('/api/financeiro/student-fees', { params: filters });
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.fees || []);
  }

  async getStudentFees(studentId: string): Promise<StudentFee[]> {
    const response = await api.get(`/api/financeiro/student-fees/student/${studentId}`);
    return response.data.data || [];
  }

  async createStudentFee(data: Partial<StudentFee>): Promise<StudentFee> {
    const response = await api.post('/api/financeiro/student-fees', data);
    return response.data.data;
  }

  async bulkCreateStudentFees(data: { student_ids: string[]; fee_type_id: string; due_date: string }): Promise<StudentFee[]> {
    const response = await api.post('/api/financeiro/student-fees/bulk', data);
    return response.data.data;
  }

  async listPayments(filters?: { student_id?: string; school_id?: string; start_date?: string; end_date?: string }): Promise<Payment[]> {
    const response = await api.get('/api/financeiro/payments', { params: filters });
    const data = response.data.data;
    return Array.isArray(data) ? data : (data?.payments || []);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/api/financeiro/payments/${id}`);
    return response.data.data;
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post('/api/financeiro/payments', data);
    return response.data.data;
  }

  async getFinancialSummary(filters?: { school_id?: string; start_date?: string; end_date?: string }): Promise<FinancialSummary> {
    const response = await api.get('/api/financeiro/summary', { params: filters });
    return response.data.data;
  }
}

export default new FinanceiroService();
