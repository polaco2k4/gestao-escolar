import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ClassesService } from './classes.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new ClassesService();

export class ClassesController {
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
      const classData = await service.getById(req.params.id, req.user);
      return sendSuccess(res, classData);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const classData = await service.create(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Turma criada com sucesso',
        data: classData
      });
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const classData = await service.update(req.params.id, req.body);
      return sendSuccess(res, classData);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await service.delete(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getStudents(req: AuthRequest, res: Response) {
    try {
      const result = await service.getStudents(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
