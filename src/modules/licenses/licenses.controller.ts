import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { LicensesService } from './licenses.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new LicensesService();

export class LicensesController {
  // ============ PLANOS ============
  
  async listPlans(req: AuthRequest, res: Response) {
    try {
      const result = await service.listPlans();
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getPlanById(req: AuthRequest, res: Response) {
    try {
      const plan = await service.getPlanById(req.params.id);
      return sendSuccess(res, plan);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createPlan(req: AuthRequest, res: Response) {
    try {
      const plan = await service.createPlan(req.body);
      return sendSuccess(res, plan, 'Plano criado com sucesso', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updatePlan(req: AuthRequest, res: Response) {
    try {
      const plan = await service.updatePlan(req.params.id, req.body);
      return sendSuccess(res, plan, 'Plano atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  // ============ LICENÇAS ============

  async listLicenses(req: AuthRequest, res: Response) {
    try {
      const result = await service.listLicenses(req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getLicenseById(req: AuthRequest, res: Response) {
    try {
      const license = await service.getLicenseById(req.params.id, req.user);
      return sendSuccess(res, license);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getLicenseBySchoolId(req: AuthRequest, res: Response) {
    try {
      const license = await service.getLicenseBySchoolId(req.params.schoolId, req.user);
      return sendSuccess(res, license);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createLicense(req: AuthRequest, res: Response) {
    try {
      const license = await service.createLicense(req.body);
      return sendSuccess(res, license, 'Licença criada com sucesso', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateLicense(req: AuthRequest, res: Response) {
    try {
      const license = await service.updateLicense(req.params.id, req.body);
      return sendSuccess(res, license, 'Licença atualizada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteLicense(req: AuthRequest, res: Response) {
    try {
      const result = await service.deleteLicense(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  // ============ VERIFICAÇÃO E ESTATÍSTICAS ============

  async checkLimits(req: AuthRequest, res: Response) {
    try {
      const result = await service.checkLimits(req.params.schoolId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getUsage(req: AuthRequest, res: Response) {
    try {
      const usage = await service.getUsage(req.params.schoolId);
      return sendSuccess(res, usage);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getGlobalStats(req: AuthRequest, res: Response) {
    try {
      const stats = await service.getGlobalStats();
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
