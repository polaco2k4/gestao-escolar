import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AssessmentTypesService } from './assessmentTypes.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new AssessmentTypesService();

export class AssessmentTypesController {
  async list(req: AuthRequest, res: Response) {
    try {
      const types = await service.list();
      return sendSuccess(res, types);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const type = await service.getById(req.params.id);
      return sendSuccess(res, type);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const type = await service.create(req.body);
      return sendSuccess(res, type, 'Tipo de avaliação criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const type = await service.update(req.params.id, req.body);
      return sendSuccess(res, type, 'Tipo de avaliação atualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id);
      return sendSuccess(res, null, 'Tipo de avaliação eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
