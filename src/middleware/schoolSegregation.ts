import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sendError } from '../utils/helpers';

/**
 * Middleware para garantir segregação de dados por escola
 * Admin não tem restrição (pode ver todas as escolas)
 * Outros usuários só veem dados da sua escola
 */
export function enforceSchoolSegregation(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return sendError(res, 'Usuário não autenticado', 401);
  }

  // Admin pode ver todas as escolas
  if (user.role === 'admin') {
    return next();
  }

  // Outros usuários devem ter school_id
  if (!user.school_id) {
    return sendError(res, 'Usuário não está associado a nenhuma escola', 403);
  }

  next();
}

/**
 * Aplica filtro de school_id em queries do Knex
 * Admin: sem filtro
 * Outros: filtra por school_id do usuário
 * 
 * Para queries com JOIN, tenta detectar a tabela principal pelo alias
 * Exemplos: 'c.school_id' para 'classes as c', 's.school_id' para 'students as s'
 */
export function applySchoolFilter(query: any, user?: { role: string; school_id?: string }, tableAlias?: string) {
  if (!user) return query;
  
  // Admin vê tudo
  if (user.role === 'admin') {
    return query;
  }

  // Outros usuários: filtrar por school_id
  if (user.school_id) {
    // Se foi fornecido um alias de tabela, usar ele
    const column = tableAlias ? `${tableAlias}.school_id` : 'school_id';
    return query.where(column, user.school_id);
  }

  // Se não tem school_id, retorna query vazia
  const column = tableAlias ? `${tableAlias}.school_id` : 'school_id';
  return query.where(column, null);
}

/**
 * Valida se o usuário pode acessar um recurso de uma escola específica
 */
export function canAccessSchool(user: { role: string; school_id?: string }, targetSchoolId?: string): boolean {
  // Admin pode acessar qualquer escola
  if (user.role === 'admin') {
    return true;
  }

  // Outros usuários só podem acessar sua própria escola
  return user.school_id === targetSchoolId;
}
