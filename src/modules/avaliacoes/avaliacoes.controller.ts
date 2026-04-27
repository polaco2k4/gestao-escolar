import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AvaliacoesService } from './avaliacoes.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';
import db from '../../config/database';

const service = new AvaliacoesService();

export class AvaliacoesController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.list(Number(page), Number(limit), filters, req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar avaliações:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listByGuardian(req: AuthRequest, res: Response) {
    try {
      // Obter o guardian_id do usuário logado (encarregado)
      const guardian = await db('guardians').where('user_id', req.user?.id).first();
      
      if (!guardian) {
        return sendError(res, 'Guardian não encontrado para este usuário', 404);
      }

      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.listByGuardian(guardian.id, Number(page), Number(limit), filters);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar avaliações do guardian:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const assessment = await service.getById(req.params.id, req.user);
      return sendSuccess(res, assessment);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const assessment = await service.create(req.body, req.user);
      return sendSuccess(res, assessment, 'Avaliação criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const assessment = await service.update(req.params.id, req.body, req.user);
      return sendSuccess(res, assessment, 'Avaliação actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id, req.user);
      return sendSuccess(res, null, 'Avaliação eliminada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listGrades(req: AuthRequest, res: Response) {
    try {
      const grades = await service.listGrades(req.params.assessmentId);
      return sendSuccess(res, grades);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listGradesByGuardian(req: AuthRequest, res: Response) {
    try {
      // Obter o guardian_id do usuário logado (encarregado)
      const guardian = await db('guardians').where('user_id', req.user?.id).first();
      
      if (!guardian) {
        return sendError(res, 'Guardian não encontrado para este usuário', 404);
      }

      const grades = await service.listGradesByGuardian(req.params.assessmentId, guardian.id);
      return sendSuccess(res, grades);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async saveGrades(req: AuthRequest, res: Response) {
    try {
      const grades = await service.saveGrades(req.params.assessmentId, req.body.grades);
      return sendSuccess(res, grades, 'Notas guardadas com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listGradeSheets(req: AuthRequest, res: Response) {
    try {
      const sheets = await service.listGradeSheets(req.query);
      return sendSuccess(res, sheets);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createGradeSheet(req: AuthRequest, res: Response) {
    try {
      const sheet = await service.createGradeSheet(req.body);
      return sendSuccess(res, sheet, 'Pauta criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async submitGradeSheet(req: AuthRequest, res: Response) {
    try {
      const sheet = await service.submitGradeSheet(req.params.id, req.user!.id);
      return sendSuccess(res, sheet, 'Pauta submetida');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async approveGradeSheet(req: AuthRequest, res: Response) {
    try {
      const sheet = await service.approveGradeSheet(req.params.id, req.user!.id);
      return sendSuccess(res, sheet, 'Pauta aprovada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
