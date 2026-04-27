import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sendError } from '../utils/helpers';

type Role = 'admin' | 'gestor' | 'professor' | 'estudante' | 'encarregado';

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Não autenticado', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Sem permissão para aceder a este recurso', 403);
    }

    next();
  };
}
