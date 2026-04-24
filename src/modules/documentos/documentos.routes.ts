import { Router } from 'express';
import { DocumentosController } from './documentos.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import upload from '../../config/storage';

const router = Router();
const controller = new DocumentosController();

router.use(authenticate);

router.get('/templates', controller.listTemplates);
router.get('/templates/:id', controller.getTemplateById);
router.post('/templates', authorize('admin'), controller.createTemplate);
router.put('/templates/:id', authorize('admin'), controller.updateTemplate);
router.delete('/templates/:id', authorize('admin'), controller.deleteTemplate);

router.get('/', controller.listDocuments);
router.get('/:id', controller.getDocumentById);
router.post('/', controller.requestDocument);
router.put('/:id/status', authorize('admin'), controller.updateDocumentStatus);
router.post('/:id/upload', authorize('admin'), upload.single('file'), controller.uploadDocumentFile);
router.delete('/:id', authorize('admin'), controller.deleteDocument);

export default router;
