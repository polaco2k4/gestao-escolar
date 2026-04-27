import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { SchoolsService } from './schools.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new SchoolsService();

export class SchoolsController {
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
      const school = await service.getById(req.params.id);
      return sendSuccess(res, school);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const school = await service.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Escola criada com sucesso',
        data: school
      });
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const school = await service.update(req.params.id, req.body);
      return sendSuccess(res, school);
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

  async getStats(req: AuthRequest, res: Response) {
    try {
      const result = await service.getStats(req.params.id, req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
