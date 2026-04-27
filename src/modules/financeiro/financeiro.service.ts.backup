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

  async deleteFeeType(id: string) {
    const deleted = await db('fee_types').where({ id }).delete();
    if (!deleted) throw new AppError('Tipo de propina não encontrado', 404);
  }

  // --- Student Fees ---
  async listStudentFees(page = 1, limit = 20, filters: any = {}, guardianId?: string) {
    const { offset } = paginate(page, limit);
    const query = db('student_fees as sf')
      .join('students as s', 's.id', 'sf.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .select('sf.*', 'u.first_name as student_first_name', 'u.last_name as student_last_name', 's.student_number', 'ft.name as fee_type_name');

    if (filters.status) query.where('sf.status', filters.status);
    if (filters.academic_year_id) query.where('sf.academic_year_id', filters.academic_year_id);
    if (guardianId) query.where('s.guardian_id', guardianId);

    const countQuery = db('student_fees as sf')
      .join('students as s', 's.id', 'sf.student_id');
    if (filters.status) countQuery.where('sf.status', filters.status);
    if (filters.academic_year_id) countQuery.where('sf.academic_year_id', filters.academic_year_id);
    if (guardianId) countQuery.where('s.guardian_id', guardianId);
    const [{ count }] = await countQuery.count('sf.id as count');
    
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
    // If academic_year_id is not provided, fetch the current academic year
    if (!data.academic_year_id) {
      const currentAcademicYear = await db('academic_years')
        .where('is_current', true)
        .first();
      
      if (!currentAcademicYear) {
        throw new AppError('Nenhum ano lectivo activo encontrado. Por favor, defina um ano lectivo como activo antes de criar propinas.', 400);
      }
      
      data.academic_year_id = currentAcademicYear.id;
    }

    // If student_id looks like a student number (not a UUID), look up the actual student UUID
    let studentId = data.student_id;
    if (studentId && !studentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const student = await db('students').where('student_number', studentId).first();
      if (!student) {
        throw new AppError('Estudante não encontrado com o número: ' + studentId, 404);
      }
      studentId = student.id;
    }

    const [fee] = await db('student_fees').insert({
      student_id: studentId,
      fee_type_id: data.fee_type_id,
      academic_year_id: data.academic_year_id,
      amount: data.amount,
      due_date: data.due_date,
      status: data.status || 'pending',
    }).returning('*');
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
  async listPayments(page = 1, limit = 20, filters: any = {}, guardianId?: string) {
    const { offset } = paginate(page, limit);
    const query = db('payments as p')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .join('students as s', 's.id', 'sf.student_id')
      .join('users as u', 'u.id', 's.user_id')
      .join('fee_types as ft', 'ft.id', 'sf.fee_type_id')
      .select('p.*', 'u.first_name as student_first_name', 'u.last_name as student_last_name', 'ft.name as fee_name');

    if (filters.student_id) query.where('p.student_id', filters.student_id);
    if (filters.school_id) query.where('p.school_id', filters.school_id);
    if (filters.start_date) query.where('p.payment_date', '>=', filters.start_date);
    if (filters.end_date) query.where('p.payment_date', '<=', filters.end_date);
    if (guardianId) query.where('s.guardian_id', guardianId);

    const countQuery = db('payments as p')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .join('students as s', 's.id', 'sf.student_id');
    if (filters.school_id) countQuery.where('p.school_id', filters.school_id);
    if (filters.start_date) countQuery.where('p.payment_date', '>=', filters.start_date);
    if (filters.end_date) countQuery.where('p.payment_date', '<=', filters.end_date);
    if (guardianId) countQuery.where('s.guardian_id', guardianId);
    const [{ count }] = await countQuery.count('p.id as count');
    
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
      const studentFee = await trx('student_fees as sf')
        .join('students as s', 's.id', 'sf.student_id')
        .where('sf.id', data.student_fee_id)
        .select('sf.*', 's.school_id')
        .first();

      if (!studentFee) throw new AppError('Propina não encontrada', 404);

      const [payment] = await trx('payments').insert({
        student_fee_id: data.student_fee_id,
        student_id: studentFee.student_id,
        school_id: studentFee.school_id,
        amount: data.amount,
        payment_date: data.payment_date || new Date(),
        payment_method: data.payment_method || 'cash',
        notes: data.notes || null,
        created_by: data.created_by || null,
      }).returning('*');

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
  async getFinancialSummary(schoolId?: string, academicYearId?: string) {
    const baseQuery = db('student_fees as sf').where('sf.status', '!=', 'cancelled');
    if (academicYearId) baseQuery.where('sf.academic_year_id', academicYearId);

    const [totalFees] = await baseQuery.clone().sum('sf.amount as total');
    
    let paymentQuery = db('payments as p')
      .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
      .sum('p.amount as total');
    
    if (schoolId) paymentQuery.where('p.school_id', schoolId);
    const [totalPaid] = await paymentQuery;

    const overdueQuery = db('student_fees as sf')
      .where('sf.status', 'pending')
      .where('sf.due_date', '<', new Date());
    
    const [overdueResult] = await overdueQuery.sum('sf.amount as total');
    const overdueAmount = Number(overdueResult?.total) || 0;

    const totalFeesAmount = Number(totalFees?.total) || 0;
    const totalPaidAmount = Number(totalPaid?.total) || 0;

    return {
      total_expected: totalFeesAmount,
      total_paid: totalPaidAmount,
      total_pending: totalFeesAmount - totalPaidAmount,
      total_overdue: overdueAmount,
      payment_rate: totalFeesAmount > 0 ? (totalPaidAmount / totalFeesAmount) * 100 : 0,
    };
  }
}
