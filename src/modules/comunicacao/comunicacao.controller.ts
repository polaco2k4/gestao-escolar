import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ComunicacaoService } from './comunicacao.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new ComunicacaoService();

export class ComunicacaoController {
  async listMessages(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await service.listMessages(req.user!.id, Number(page), Number(limit));
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getMessageById(req: AuthRequest, res: Response) {
    try {
      const message = await service.getMessageById(req.params.id, req.user!.id);
      return sendSuccess(res, message);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const message = await service.sendMessage(req.user!.id, req.body);
      return sendSuccess(res, message, 'Mensagem enviada', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteMessage(req: AuthRequest, res: Response) {
    try {
      await service.deleteMessage(req.params.id, req.user!.id);
      return sendSuccess(res, null, 'Mensagem eliminada');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listNotifications(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await service.listNotifications(req.user!.id, Number(page), Number(limit));
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const notification = await service.markAsRead(req.params.id, req.user!.id);
      return sendSuccess(res, notification);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await service.markAllAsRead(req.user!.id);
      return sendSuccess(res, null, 'Todas as notificações marcadas como lidas');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
