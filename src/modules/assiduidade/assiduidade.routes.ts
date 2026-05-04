import { Router } from 'express';
import { AssiduidadeController } from './assiduidade.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new AssiduidadeController();

router.use(authenticate);

router.get('/justifications', authorize('admin', 'gestor', 'professor'), controller.listJustifications);
router.post('/justifications', authorize('admin', 'gestor', 'professor'), controller.submitJustification);
router.put('/justifications/:id/review', authorize('admin', 'gestor', 'professor'), controller.reviewJustification);
router.delete('/justifications/:id', authorize('admin', 'gestor', 'professor'), controller.deleteJustification);

router.get('/summary/student/:studentId', controller.getStudentSummary);
router.get('/summary/class/:classId', authorize('admin', 'gestor', 'professor'), controller.getClassSummary);

router.get('/student/:studentId', controller.getByStudent);
router.get('/class/:classId/date/:date', controller.getByClassAndDate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'gestor', 'professor'), controller.record);
router.post('/bulk', authorize('admin', 'gestor', 'professor'), controller.bulkRecord);
router.put('/:id', authorize('admin', 'gestor', 'professor'), controller.update);
router.delete('/:id', authorize('admin', 'gestor', 'professor'), controller.delete);

export default router;
