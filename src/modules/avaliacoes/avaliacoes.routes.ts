import { Router } from 'express';
import { AvaliacoesController } from './avaliacoes.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new AvaliacoesController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'professor'), controller.create);
router.put('/:id', authorize('admin', 'professor'), controller.update);
router.delete('/:id', authorize('admin', 'professor'), controller.delete);

router.get('/:assessmentId/grades', controller.listGrades);
router.post('/:assessmentId/grades', authorize('admin', 'professor'), controller.saveGrades);

router.get('/sheets/list', authorize('admin', 'professor'), controller.listGradeSheets);
router.post('/sheets', authorize('admin', 'professor'), controller.createGradeSheet);
router.put('/sheets/:id/submit', authorize('professor'), controller.submitGradeSheet);
router.put('/sheets/:id/approve', authorize('admin'), controller.approveGradeSheet);

export default router;
