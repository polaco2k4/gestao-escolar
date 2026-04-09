import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AcademicYearsService } from './academicYears.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new AcademicYearsService();

export class AcademicYearsController {
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
      const academicYear = await service.getById(req.params.id);
      return sendSuccess(res, academicYear);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getCurrent(req: AuthRequest, res: Response) {
    try {
      const academicYear = await service.getCurrent();
      return sendSuccess(res, academicYear);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
