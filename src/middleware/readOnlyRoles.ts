import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthPayload } from './auth';

const READ_ONLY_ROLES = ['estudante', 'encarregado'] as const;
const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Operações de escrita permitidas para roles só-de-leitura
const ALLOWED_WRITES: { method: string; pattern: RegExp }[] = [
  { method: 'POST', pattern: /^\/api\/auth\/logout$/ },
  { method: 'POST', pattern: /^\/api\/auth\/refresh-token$/ },
  { method: 'PUT',  pattern: /^\/api\/auth\/change-password$/ },
  { method: 'PUT',  pattern: /^\/api\/comunicacao\/notifications\/[^/]+\/read$/ },
  { method: 'PUT',  pattern: /^\/api\/comunicacao\/notifications\/read-all$/ },
];

export function enforceReadOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!WRITE_METHODS.includes(req.method)) return next();

  // Decodificar token silenciosamente (sem rejeitar pedidos sem token)
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  let payload: AuthPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthPayload;
  } catch {
    return next();
  }

  if (!READ_ONLY_ROLES.includes(payload.role as any)) return next();

  const isAllowed = ALLOWED_WRITES.some(
    (a) => a.method === req.method && a.pattern.test(req.path)
  );

  if (isAllowed) return next();

  return res.status(403).json({
    success: false,
    message: 'Sem permissão para realizar esta operação.',
  });
}
