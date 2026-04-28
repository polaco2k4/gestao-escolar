import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { LicensesService } from '../modules/licenses/licenses.service';
import { sendError } from '../utils/helpers';

const licensesService = new LicensesService();

/**
 * Middleware para verificar se a escola tem licença válida
 * Usado em operações críticas como criar alunos, professores, turmas
 */
export async function checkLicense(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Admin bypassa verificação
    if (req.user?.role === 'admin') {
      return next();
    }

    // Obter school_id do usuário ou do body
    const schoolId = req.user?.school_id || req.body?.school_id;
    
    if (!schoolId) {
      return sendError(res, 'Escola não identificada', 400);
    }

    // Verificar limites
    const check = await licensesService.checkLimits(schoolId);

    if (!check.valid) {
      return sendError(res, `Licença inválida: ${check.violations.join(', ')}`, 403);
    }

    // Licença válida, continuar
    next();
  } catch (error: any) {
    return sendError(res, error.message || 'Erro ao verificar licença', 500);
  }
}

/**
 * Middleware para verificar limite específico antes de criar recurso
 * Exemplo: checkResourceLimit('students')
 */
export function checkResourceLimit(resourceType: 'students' | 'teachers' | 'classes') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Admin bypassa verificação
      if (req.user?.role === 'admin') {
        return next();
      }

      const schoolId = req.user?.school_id || req.body?.school_id;
      
      if (!schoolId) {
        return sendError(res, 'Escola não identificada', 400);
      }

      const usage = await licensesService.getUsage(schoolId);
      const license = await licensesService.getLicenseBySchoolId(schoolId);

      // Verificar limite específico
      let exceeded = false;
      let message = '';

      switch (resourceType) {
        case 'students':
          if (license.max_students && usage.current_students >= license.max_students) {
            exceeded = true;
            message = `Limite de alunos atingido (${usage.current_students}/${license.max_students}). Atualize seu plano.`;
          }
          break;
        case 'teachers':
          if (license.max_teachers && usage.current_teachers >= license.max_teachers) {
            exceeded = true;
            message = `Limite de professores atingido (${usage.current_teachers}/${license.max_teachers}). Atualize seu plano.`;
          }
          break;
        case 'classes':
          if (license.max_classes && usage.current_classes >= license.max_classes) {
            exceeded = true;
            message = `Limite de turmas atingido (${usage.current_classes}/${license.max_classes}). Atualize seu plano.`;
          }
          break;
      }

      if (exceeded) {
        return sendError(res, message, 403);
      }

      next();
    } catch (error: any) {
      return sendError(res, error.message || 'Erro ao verificar limite', 500);
    }
  };
}

/**
 * Middleware para adicionar informações de licença ao response
 * Útil para mostrar warnings no frontend
 */
export async function attachLicenseInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user?.school_id) {
      const usage = await licensesService.getUsage(req.user.school_id);
      
      // Adicionar headers com informações de uso
      res.setHeader('X-License-Students-Usage', `${usage.current_students}/${usage.max_students || 'unlimited'}`);
      res.setHeader('X-License-Teachers-Usage', `${usage.current_teachers}/${usage.max_teachers || 'unlimited'}`);
      res.setHeader('X-License-Classes-Usage', `${usage.current_classes}/${usage.max_classes || 'unlimited'}`);
      
      // Warnings se estiver próximo do limite (>80%)
      const warnings: string[] = [];
      if (usage.students_percentage > 80) warnings.push('students');
      if (usage.teachers_percentage > 80) warnings.push('teachers');
      if (usage.classes_percentage > 80) warnings.push('classes');
      
      if (warnings.length > 0) {
        res.setHeader('X-License-Warnings', warnings.join(','));
      }
    }
    
    next();
  } catch (error) {
    // Não bloquear a requisição se houver erro ao obter info de licença
    next();
  }
}
