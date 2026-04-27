import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { CoursesService } from './courses.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new CoursesService();

export class CoursesController {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await service.list(req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const course = await service.getById(req.params.id, req.user);
      return sendSuccess(res, course);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const course = await service.create(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Curso criado com sucesso',
        data: course
      });
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const course = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, course);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await service.delete(req.params.id, req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
