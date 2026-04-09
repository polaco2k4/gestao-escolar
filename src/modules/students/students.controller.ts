import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { StudentsService } from './students.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new StudentsService();

export class StudentsController {
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
      const student = await service.getById(req.params.id);
      return sendSuccess(res, student);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
