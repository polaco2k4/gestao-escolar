import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AcademicYearsService } from './academicYears.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new AcademicYearsService();

export class AcademicYearsController {
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
      const academicYear = await service.getById(req.params.id, req.user);
      return sendSuccess(res, academicYear);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getCurrent(req: AuthRequest, res: Response) {
    try {
      const academicYear = await service.getCurrent(req.user);
      return sendSuccess(res, academicYear);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const academicYear = await service.create(req.body, req.user);
      return sendSuccess(res, academicYear, 'Ano lectivo criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const academicYear = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, academicYear, 'Ano lectivo atualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id, req.user);
      return sendSuccess(res, null, 'Ano lectivo eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
