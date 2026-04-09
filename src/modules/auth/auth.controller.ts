import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/helpers';
import logger from '../../utils/logger';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'Registo efectuado com sucesso', 201);
    } catch (error: any) {
      logger.error('Erro no registo:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, result, 'Login efectuado com sucesso');
    } catch (error: any) {
      logger.error('Erro no login:', error);
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async refreshToken(req: AuthRequest, res: Response) {
    try {
      const { refresh_token } = req.body;
      const tokens = await authService.refreshToken(refresh_token);
      return sendSuccess(res, tokens, 'Token renovado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      await authService.logout(req.user!.id);
      return sendSuccess(res, null, 'Sessão terminada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getProfile(req.user!.id);
      return sendSuccess(res, user);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { current_password, new_password } = req.body;
      await authService.changePassword(req.user!.id, current_password, new_password);
      return sendSuccess(res, null, 'Password alterada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
