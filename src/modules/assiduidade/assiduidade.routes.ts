import { Router } from 'express';
import { AssiduidadeController } from './assiduidade.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new AssiduidadeController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/student/:studentId', controller.getByStudent);
router.get('/class/:classId/date/:date', controller.getByClassAndDate);
router.post('/', authorize('admin', 'professor'), controller.record);
router.post('/bulk', authorize('admin', 'professor'), controller.bulkRecord);
router.put('/:id', authorize('admin', 'professor'), controller.update);

router.get('/justifications', authorize('admin', 'professor'), controller.listJustifications);
router.post('/justifications', authorize('encarregado', 'estudante'), controller.submitJustification);
router.put('/justifications/:id/review', authorize('admin', 'professor'), controller.reviewJustification);

router.get('/summary/student/:studentId', controller.getStudentSummary);
router.get('/summary/class/:classId', authorize('admin', 'professor'), controller.getClassSummary);

export default router;
