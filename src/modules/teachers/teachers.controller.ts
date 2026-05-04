import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { TeachersService } from './teachers.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new TeachersService();

export class TeachersController {
  async list(req: AuthRequest, res: Response) {
    try {
      const teachers = await service.list(req.user);
      return sendSuccess(res, teachers);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const teacher = await service.getById(req.params.id, req.user);
      return sendSuccess(res, teacher);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const teacher = await service.create(req.body, req.user);
      return sendSuccess(res, teacher, 'Professor criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const teacher = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, teacher, 'Professor atualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async toggleActive(req: AuthRequest, res: Response) {
    try {
      const result = await service.toggleActive(req.params.id);
      const msg = result.active ? 'Professor activado com sucesso' : 'Professor desactivado com sucesso';
      return sendSuccess(res, result, msg);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id);
      return sendSuccess(res, null, 'Professor eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
