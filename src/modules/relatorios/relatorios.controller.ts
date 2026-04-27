import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { RelatoriosService } from './relatorios.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new RelatoriosService();

export class RelatoriosController {
  async getStudentsReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.getStudentsReport(req.query, req.user);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getAttendanceReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.getAttendanceReport(req.query, req.user);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getGradesReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.getGradesReport(req.query, req.user);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getFinancialReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.getFinancialReport(req.query, req.user);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getEnrollmentsReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.getEnrollmentsReport(req.query, req.user);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
