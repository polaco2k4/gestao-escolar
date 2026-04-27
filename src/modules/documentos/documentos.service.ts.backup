import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { paginate, buildPaginationMeta } from '../../utils/helpers';

export class DocumentosService {
  async listTemplates(schoolId?: string) {
    const query = db('document_templates');
    if (schoolId) query.where('school_id', schoolId);
    return query.where('active', true).orderBy('name');
  }

  async createTemplate(data: any) {
    const [template] = await db('document_templates').insert(data).returning('*');
    return template;
  }

  async getTemplateById(id: string) {
    const template = await db('document_templates').where({ id }).first();
    if (!template) throw new AppError('Modelo não encontrado', 404);
    return template;
  }

  async updateTemplate(id: string, data: any) {
    const [updated] = await db('document_templates').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!updated) throw new AppError('Modelo não encontrado', 404);
    return updated;
  }

  async deleteTemplate(id: string) {
    const deleted = await db('document_templates').where({ id }).delete();
    if (!deleted) throw new AppError('Modelo não encontrado', 404);
    return { message: 'Modelo eliminado com sucesso' };
  }

  async listDocuments(page = 1, limit = 20, filters: any = {}) {
    const { offset } = paginate(page, limit);
    const query = db('documents as d')
      .leftJoin('students as s', 's.id', 'd.student_id')
      .leftJoin('users as u', 'u.id', 's.user_id')
      .leftJoin('document_templates as dt', 'dt.id', 'd.template_id')
      .select('d.*', 'u.first_name', 'u.last_name', 'dt.name as template_name');

    if (filters.status) query.where('d.status', filters.status);
    if (filters.type) query.where('d.type', filters.type);
    if (filters.student_id) query.where('d.student_id', filters.student_id);
    if (filters.requested_by) query.where('d.requested_by', filters.requested_by);

    const [{ count }] = await db('documents').count('id as count');
    const documents = await query.orderBy('d.created_at', 'desc').limit(limit).offset(offset);
    return { documents, meta: buildPaginationMeta(Number(count), page, limit) };
  }

  async getDocumentById(id: string) {
    const document = await db('documents as d')
      .leftJoin('students as s', 's.id', 'd.student_id')
      .leftJoin('users as u', 'u.id', 's.user_id')
      .leftJoin('document_templates as dt', 'dt.id', 'd.template_id')
      .select('d.*', 'u.first_name', 'u.last_name', 'dt.name as template_name', 'dt.content_template')
      .where('d.id', id)
      .first();
    if (!document) throw new AppError('Documento não encontrado', 404);
    return document;
  }

  async requestDocument(data: any) {
    const [document] = await db('documents').insert(data).returning('*');
    return document;
  }

  async updateDocumentStatus(id: string, status: string, notes?: string) {
    const updateData: any = { status, updated_at: new Date() };
    if (status === 'ready') updateData.generated_at = new Date();
    if (status === 'delivered') updateData.delivered_at = new Date();
    if (notes) updateData.notes = notes;

    const [updated] = await db('documents').where({ id }).update(updateData).returning('*');
    if (!updated) throw new AppError('Documento não encontrado', 404);
    return updated;
  }

  async uploadDocumentFile(id: string, fileUrl: string) {
    const [updated] = await db('documents')
      .where({ id })
      .update({ file_url: fileUrl, status: 'ready', generated_at: new Date(), updated_at: new Date() })
      .returning('*');
    if (!updated) throw new AppError('Documento não encontrado', 404);
    return updated;
  }

  async deleteDocument(id: string) {
    const deleted = await db('documents').where({ id }).delete();
    if (!deleted) throw new AppError('Documento não encontrado', 404);
    return { message: 'Documento eliminado com sucesso' };
  }
}
