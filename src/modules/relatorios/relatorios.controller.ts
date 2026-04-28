import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { RelatoriosService } from './relatorios.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new RelatoriosService();

export class RelatoriosController {
  // ==================== CRUD de Relatórios Personalizados ====================
  
  async createCustomReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.createCustomReport(req.body, req.user!);
      return sendSuccess(res, report, 'Relatório criado com sucesso', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getAllCustomReports(req: AuthRequest, res: Response) {
    try {
      const reports = await service.getAllCustomReports(req.user!);
      return sendSuccess(res, reports);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getCustomReportById(req: AuthRequest, res: Response) {
    try {
      const report = await service.getCustomReportById(req.params.id, req.user!);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateCustomReport(req: AuthRequest, res: Response) {
    try {
      const report = await service.updateCustomReport(req.params.id, req.body, req.user!);
      return sendSuccess(res, report);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteCustomReport(req: AuthRequest, res: Response) {
    try {
      const result = await service.deleteCustomReport(req.params.id, req.user!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async executeCustomReport(req: AuthRequest, res: Response) {
    try {
      const result = await service.executeCustomReport(req.params.id, req.query, req.user!);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  // ==================== Relatórios Predefinidos ====================
  
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
