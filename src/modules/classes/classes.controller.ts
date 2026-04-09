import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ClassesService } from './classes.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new ClassesService();

export class ClassesController {
  async list(req: AuthRequest, res: Response) {
    try {
      const result = await service.list();
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const classData = await service.getById(req.params.id);
      return sendSuccess(res, classData);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
