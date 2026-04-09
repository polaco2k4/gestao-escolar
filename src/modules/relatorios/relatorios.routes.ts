import { Router } from 'express';
import { RelatoriosController } from './relatorios.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new RelatoriosController();

router.use(authenticate);
router.use(authorize('admin', 'professor'));

router.get('/students', controller.getStudentsReport);
router.get('/attendance', controller.getAttendanceReport);
router.get('/grades', controller.getGradesReport);
router.get('/financial', controller.getFinancialReport);
router.get('/enrollments', controller.getEnrollmentsReport);

export default router;
