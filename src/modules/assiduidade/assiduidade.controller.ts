import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AssiduidadeService } from './assiduidade.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';

const service = new AssiduidadeService();

export class AssiduidadeController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.list(Number(page), Number(limit), filters);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar presenças:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getByStudent(req: AuthRequest, res: Response) {
    try {
      const records = await service.getByStudent(req.params.studentId, req.query);
      return sendSuccess(res, records);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getByClassAndDate(req: AuthRequest, res: Response) {
    try {
      const records = await service.getByClassAndDate(req.params.classId, req.params.date);
      return sendSuccess(res, records);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async record(req: AuthRequest, res: Response) {
    try {
      const record = await service.record({ ...req.body, recorded_by: req.user!.id });
      return sendSuccess(res, record, 'Presença registada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async bulkRecord(req: AuthRequest, res: Response) {
    try {
      const records = await service.bulkRecord(req.body.records);
      return sendSuccess(res, records, `${records.length} registos processados`, 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const record = await service.update(req.params.id, req.body);
      return sendSuccess(res, record, 'Registo actualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listJustifications(req: AuthRequest, res: Response) {
    try {
      const justifications = await service.listJustifications(req.query);
      return sendSuccess(res, justifications);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async submitJustification(req: AuthRequest, res: Response) {
    try {
      const justification = await service.submitJustification({ ...req.body, submitted_by: req.user!.id });
      return sendSuccess(res, justification, 'Justificação submetida', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async reviewJustification(req: AuthRequest, res: Response) {
    try {
      const justification = await service.reviewJustification(req.params.id, req.user!.id, req.body.status);
      return sendSuccess(res, justification, 'Justificação revista');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getStudentSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await service.getStudentSummary(req.params.studentId, req.query.academic_year_id as string);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getClassSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await service.getClassSummary(req.params.classId, req.query.date as string);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
