import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { SubjectsService } from './subjects.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new SubjectsService();

export class SubjectsController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { course_id } = req.query as { course_id?: string };
      const subjects = await service.list(req.user, { course_id });
      return sendSuccess(res, subjects);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const subject = await service.getById(req.params.id, req.user);
      return sendSuccess(res, subject);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const subject = await service.create(req.body, req.user);
      return sendSuccess(res, subject, 'Disciplina criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const subject = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, subject, 'Disciplina atualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id, req.user);
      return sendSuccess(res, null, 'Disciplina eliminada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
