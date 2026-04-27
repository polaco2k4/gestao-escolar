import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { DocumentosService } from './documentos.service';
import { sendSuccess, sendError } from '../../utils/helpers';

const service = new DocumentosService();

export class DocumentosController {
  async listTemplates(req: AuthRequest, res: Response) {
    try {
      const templates = await service.listTemplates(req.user);
      return sendSuccess(res, templates);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getTemplateById(req: AuthRequest, res: Response) {
    try {
      const template = await service.getTemplateById(req.params.id, req.user);
      return sendSuccess(res, template);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async createTemplate(req: AuthRequest, res: Response) {
    try {
      const template = await service.createTemplate(req.body, req.user);
      return sendSuccess(res, template, 'Modelo criado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateTemplate(req: AuthRequest, res: Response) {
    try {
      const template = await service.updateTemplate(req.params.id, req.body, req.user);
      return sendSuccess(res, template, 'Modelo actualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      const result = await service.deleteTemplate(req.params.id, req.user);
      return sendSuccess(res, result, 'Modelo eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async listDocuments(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const result = await service.listDocuments(Number(page), Number(limit), filters, req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getDocumentById(req: AuthRequest, res: Response) {
    try {
      const document = await service.getDocumentById(req.params.id, req.user);
      return sendSuccess(res, document);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async requestDocument(req: AuthRequest, res: Response) {
    try {
      const document = await service.requestDocument({ ...req.body, requested_by: req.user!.id }, req.user);
      return sendSuccess(res, document, 'Documento solicitado', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async updateDocumentStatus(req: AuthRequest, res: Response) {
    try {
      const { status, notes } = req.body;
      const document = await service.updateDocumentStatus(req.params.id, status, req.user, notes);
      return sendSuccess(res, document, 'Estado actualizado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async uploadDocumentFile(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'Nenhum ficheiro enviado', 400);
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      const document = await service.uploadDocumentFile(req.params.id, fileUrl);
      return sendSuccess(res, document, 'Ficheiro carregado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const result = await service.deleteDocument(req.params.id);
      return sendSuccess(res, result, 'Documento eliminado');
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
