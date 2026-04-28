import { Router } from 'express';
import { RelatoriosController } from './relatorios.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new RelatoriosController();

router.use(authenticate);
router.use(authorize('admin', 'gestor', 'professor'));

// Rotas de relatórios personalizados (CRUD)
router.post('/custom', controller.createCustomReport.bind(controller));
router.get('/custom', controller.getAllCustomReports.bind(controller));
router.get('/custom/:id', controller.getCustomReportById.bind(controller));
router.put('/custom/:id', controller.updateCustomReport.bind(controller));
router.delete('/custom/:id', controller.deleteCustomReport.bind(controller));
router.get('/custom/:id/execute', controller.executeCustomReport.bind(controller));

// Rotas de relatórios predefinidos
router.get('/students', controller.getStudentsReport.bind(controller));
router.get('/attendance', controller.getAttendanceReport.bind(controller));
router.get('/grades', controller.getGradesReport.bind(controller));
router.get('/financial', controller.getFinancialReport.bind(controller));
router.get('/enrollments', controller.getEnrollmentsReport.bind(controller));

export default router;
