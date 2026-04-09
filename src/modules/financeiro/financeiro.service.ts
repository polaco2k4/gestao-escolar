import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';

export class FinanceiroService {
  // --- Fee Types ---
  async listFeeTypes(schoolId?: string) {
    const query = db('fee_types');
    if (schoolId) query.where('school_id', schoolId);
    return query.orderBy('name');
  }

  async createFeeType(data: any) {
    const [feeType] = await db('fee_types').insert(data).returning('*');
    return feeType;
  }

  async updateFeeType(id: string, data: any) {
    const [updated] = await db('fee_types').where({ id }).update(data).returning('*');
    if (!updated) throw new AppError('Tipo de propina não encontrado', 404);
    return updated;
  }

  // --- Student Fees ---
  async listStudentFees(page = 1, limit = 20, filters: any = {}) {
    const { offset } = paginate(page, limit);
    const query = db('student_fees as sf')
      .join('students as s', 's.id', 'sf.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .select('sf.*', 'u.first_name', 'u.last_name', 's.student_number', 'ft.name as fee_type_name');

    if (filters.status) query.where('sf.status', filters.status);
    if (filters.academic_year_id) query.where('sf.academic_year_id', filters.academic_year_id);

    const [{ count }] = await db('student_fees').count('id as count');
    const fees = await query.orderBy('sf.due_date', 'desc').limit(limit).offset(offset);
    return { fees, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getStudentFees(studentId: string) {
    return db('student_fees as sf')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .join('academic_years as ay', 'ay.id', 'sf.academic_year_id')
      .select('sf.*', 'ft.name as fee_type_name', 'ay.name as academic_year_name')
      .where('sf.student_id', studentId)
      .orderBy('sf.due_date', 'desc');
  }

  async createStudentFee(data: any) {
    const [fee] = await db('student_fees').insert(data).returning('*');
    return fee;
  }

  async bulkCreateStudentFees(feeTypeId: string, academicYearId: string, classId: string) {
    const feeType = await db('fee_types').where({ id: feeTypeId }).first();
    if (!feeType) throw new AppError('Tipo de propina não encontrado', 404);

    const enrollments = await db('enrollments')
      .where({ class_id: classId, academic_year_id: academicYearId, status: 'active' })
      .select('student_id');

    const fees = enrollments.map((e: any) => ({
      student_id: e.student_id,
      fee_type_id: feeTypeId,
      academic_year_id: academicYearId,
      amount: feeType.amount,
      due_date: new Date(),
    }));

    const created = await db('student_fees').insert(fees).returning('*');
    return created;
  }

  // --- Payments ---
  async listPayments(page = 1, limit = 20, filters: any = {}) {
    const { offset } = paginate(page, limit);
    const query = db('payments as p')
      .join('students as s', 's.id', 'p.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .select('p.*', 'u.first_name', 'u.last_name', 's.student_number', 'ft.name as fee_type_name');

    if (filters.student_id) query.where('p.student_id', filters.student_id);
    if (filters.payment_method) query.where('p.payment_method', filters.payment_method);

    const [{ count }] = await db('payments').count('id as count');
    const payments = await query.orderBy('p.payment_date', 'desc').limit(limit).offset(offset);
    return { payments, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getPaymentById(id: string) {
    const payment = await db('payments as p')
      .join('students as s', 's.id', 'p.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .select('p.*', 'u.first_name', 'u.last_name', 's.student_number')
      .where('p.id', id)
      .first();
    if (!payment) throw new AppError('Pagamento não encontrado', 404);
    return payment;
  }

  async createPayment(data: any) {
    return db.transaction(async (trx: any) => {
      const [payment] = await trx('payments').insert(data).returning('*');

      const studentFee = await trx('student_fees').where({ id: data.student_fee_id }).first();
      const totalPaid = await trx('payments')
        .where({ student_fee_id: data.student_fee_id })
        .sum('amount as total');

      const paid = Number(totalPaid[0].total) || 0;
      let newStatus = 'partial';
      if (paid >= studentFee.amount) newStatus = 'paid';

      await trx('student_fees')
        .where({ id: data.student_fee_id })
        .update({ status: newStatus, updated_at: new Date() });

      return payment;
    });
  }

  // --- Summary ---
  async getFinancialSummary(schoolId: string, academicYearId?: string) {
    const baseQuery = db('student_fees as sf').where('sf.status', '!=', 'cancelled');
    if (academicYearId) baseQuery.where('sf.academic_year_id', academicYearId);

    const [totalFees] = await baseQuery.clone().sum('sf.amount as total');
    const [totalPaid] = await db('payments as p')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .where('p.school_id', schoolId)
      .sum('p.amount as total');

    const [overdue] = await db('student_fees')
      .where('status', 'pending')
      .where('due_date', '<', new Date())
      .count('id as count');

    return {
      total_fees: Number(totalFees.total) || 0,
      total_paid: Number(totalPaid.total) || 0,
      total_pending: (Number(totalFees.total) || 0) - (Number(totalPaid.total) || 0),
      overdue_count: Number(overdue.count) || 0,
    };
  }
}
