import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { MatriculasService } from './matriculas.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';

const service = new MatriculasService();

export class MatriculasController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.list(Number(page), Number(limit), filters);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar matrículas:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const enrollment = await service.getById(req.params.id);
      return sendSuccess(res, enrollment);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const enrollment = await service.create({ ...req.body, school_id: req.user?.id });
      return sendSuccess(res, enrollment, 'Matrícula criada com sucesso', 201);
    } catch (error: any) {
      logger.error('Erro ao criar matrícula:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const enrollment = await service.update(req.params.id, req.body);
      return sendSuccess(res, enrollment, 'Matrícula actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id);
      return sendSuccess(res, null, 'Matrícula eliminada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createTransfer(req: AuthRequest, res: Response) {
    try {
      const transfer = await service.createTransfer(req.body);
      return sendSuccess(res, transfer, 'Transferência criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listTransfers(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const transfers = await service.listTransfers(Number(page), Number(limit));
      return sendSuccess(res, transfers);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async approveTransfer(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const transfer = await service.approveTransfer(req.params.id, req.user!.id, status);
      return sendSuccess(res, transfer, 'Transferência actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
