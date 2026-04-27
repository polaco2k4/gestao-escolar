import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { GuardiansService } from './guardians.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new GuardiansService();

export class GuardiansController {
  async list(req: AuthRequest, res: Response) {
    try {
      const guardians = await service.list(req.user);
      return sendSuccess(res, guardians);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const guardian = await service.getById(req.params.id, req.user);
      return sendSuccess(res, guardian);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const guardian = await service.create(req.body, req.user);
      return sendSuccess(res, guardian, 'Encarregado criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const guardian = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, guardian, 'Encarregado atualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id, req.user);
      return sendSuccess(res, null, 'Encarregado eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
