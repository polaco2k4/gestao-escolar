import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { FinanceiroService } from './financeiro.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';
import db from '../../config/database';

const service = new FinanceiroService();

export class FinanceiroController {
  async listFeeTypes(req: AuthRequest, res: Response) {
    try {
      const feeTypes = await service.listFeeTypes(req.user);
      return sendSuccess(res, feeTypes);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createFeeType(req: AuthRequest, res: Response) {
    try {
      const feeType = await service.createFeeType(req.body, req.user);
      return sendSuccess(res, feeType, 'Tipo de propina criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateFeeType(req: AuthRequest, res: Response) {
    try {
      const feeType = await service.updateFeeType(req.params.id, req.body, req.user);
      return sendSuccess(res, feeType, 'Tipo de propina actualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteFeeType(req: AuthRequest, res: Response) {
    try {
      await service.deleteFeeType(req.params.id, req.user);
      return sendSuccess(res, null, 'Tipo de propina eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listStudentFees(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      
      // If user is guardian, filter by their students
      let guardianId = filters.guardian_id as string;
      if (req.user?.role === 'encarregado' && !guardianId) {
        const guardian = await db('guardians').where('user_id', req.user.id).first();
        if (guardian) {
          guardianId = guardian.id;
        }
      }
      
      const result = await service.listStudentFees(Number(page), Number(limit), filters, req.user, guardianId);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar propinas:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getStudentFees(req: AuthRequest, res: Response) {
    try {
      const fees = await service.getStudentFees(req.params.studentId);
      return sendSuccess(res, fees);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createStudentFee(req: AuthRequest, res: Response) {
    try {
      logger.info('Creating student fee with data:', req.body);
      const fee = await service.createStudentFee(req.body, req.user);
      return sendSuccess(res, fee, 'Propina atribuída', 201);
    } catch (error: any) {
      logger.error('Error creating student fee:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async bulkCreateStudentFees(req: AuthRequest, res: Response) {
    try {
      const { fee_type_id, academic_year_id, class_id } = req.body;
      const fees = await service.bulkCreateStudentFees(fee_type_id, academic_year_id, class_id);
      return sendSuccess(res, fees, `${fees.length} propinas criadas`, 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listPayments(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      
      // If user is guardian, filter by their students
      let guardianId = filters.guardian_id as string;
      if (req.user?.role === 'encarregado' && !guardianId) {
        const guardian = await db('guardians').where('user_id', req.user.id).first();
        if (guardian) {
          guardianId = guardian.id;
        }
      }
      
      const result = await service.listPayments(Number(page), Number(limit), filters, req.user, guardianId);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar pagamentos:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getPaymentById(req: AuthRequest, res: Response) {
    try {
      const payment = await service.getPaymentById(req.params.id);
      return sendSuccess(res, payment);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createPayment(req: AuthRequest, res: Response) {
    try {
      const payment = await service.createPayment({ ...req.body, created_by: req.user!.id });
      return sendSuccess(res, payment, 'Pagamento registado', 201);
    } catch (error: any) {
      logger.error('Erro ao registar pagamento:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getFinancialSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await service.getFinancialSummary(
        req.query.school_id as string,
        req.query.academic_year_id as string,
        req.user
      );
      return sendSuccess(res, summary);
    } catch (error: any) {
      logger.error('Erro ao obter resumo financeiro:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
