import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { HorariosService } from './horarios.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';

const service = new HorariosService();

export class HorariosController {
  async listSchedules(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.listSchedules(Number(page), Number(limit), filters);
      return sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Erro ao listar horários:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getScheduleById(req: AuthRequest, res: Response) {
    try {
      const schedule = await service.getScheduleById(req.params.id);
      return sendSuccess(res, schedule);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createSchedule(req: AuthRequest, res: Response) {
    try {
      const schedule = await service.createSchedule(req.body);
      return sendSuccess(res, schedule, 'Horário criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const schedule = await service.updateSchedule(req.params.id, req.body);
      return sendSuccess(res, schedule, 'Horário actualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteSchedule(req: AuthRequest, res: Response) {
    try {
      await service.deleteSchedule(req.params.id);
      return sendSuccess(res, null, 'Horário eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listClasses(req: AuthRequest, res: Response) {
    try {
      const classes = await service.listClasses(req.query);
      return sendSuccess(res, classes);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getClassById(req: AuthRequest, res: Response) {
    try {
      const cls = await service.getClassById(req.params.id);
      return sendSuccess(res, cls);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createClass(req: AuthRequest, res: Response) {
    try {
      const cls = await service.createClass(req.body);
      return sendSuccess(res, cls, 'Turma criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateClass(req: AuthRequest, res: Response) {
    try {
      const cls = await service.updateClass(req.params.id, req.body);
      return sendSuccess(res, cls, 'Turma actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listSubjects(req: AuthRequest, res: Response) {
    try {
      const subjects = await service.listSubjects(req.query);
      return sendSuccess(res, subjects);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createSubject(req: AuthRequest, res: Response) {
    try {
      const subject = await service.createSubject(req.body);
      return sendSuccess(res, subject, 'Disciplina criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateSubject(req: AuthRequest, res: Response) {
    try {
      const subject = await service.updateSubject(req.params.id, req.body);
      return sendSuccess(res, subject, 'Disciplina actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listRooms(req: AuthRequest, res: Response) {
    try {
      const rooms = await service.listRooms(req.query);
      return sendSuccess(res, rooms);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createRoom(req: AuthRequest, res: Response) {
    try {
      const room = await service.createRoom(req.body);
      return sendSuccess(res, room, 'Sala criada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateRoom(req: AuthRequest, res: Response) {
    try {
      const room = await service.updateRoom(req.params.id, req.body);
      return sendSuccess(res, room, 'Sala actualizada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getScheduleByClass(req: AuthRequest, res: Response) {
    try {
      const schedule = await service.getScheduleByClass(req.params.classId);
      return sendSuccess(res, schedule);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getScheduleByTeacher(req: AuthRequest, res: Response) {
    try {
      const schedule = await service.getScheduleByTeacher(req.params.teacherId);
      return sendSuccess(res, schedule);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
