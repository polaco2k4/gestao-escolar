import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { StudentsService } from './students.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';

const service = new StudentsService();

export class StudentsController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.list(Number(page), Number(limit), filters);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar estudantes:', error);
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

  async create(req: AuthRequest, res: Response) {
    try {
      const student = await service.create({ ...req.body, user_id: req.user?.id });
      return sendSuccess(res, student, 'Estudante criado com sucesso', 201);
    } catch (error: any) {
      logger.error('Erro ao criar estudante:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const student = await service.update(req.params.id, req.body);
      return sendSuccess(res, student, 'Estudante actualizado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao actualizar estudante:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id);
      return sendSuccess(res, null, 'Estudante eliminado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao eliminar estudante:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
