import { Router } from 'express';
import { AvaliacoesController } from './avaliacoes.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new AvaliacoesController();

router.use(authenticate);

router.get('/my-assessments', authorize('encarregado'), (req, res) => controller.listByGuardian(req, res));
router.get('/sheets/list', authorize('admin', 'gestor', 'professor'), (req, res) => controller.listGradeSheets(req, res));
router.post('/sheets', authorize('admin', 'gestor', 'professor'), (req, res) => controller.createGradeSheet(req, res));
router.put('/sheets/:id/submit', authorize('professor'), (req, res) => controller.submitGradeSheet(req, res));
router.put('/sheets/:id/approve', authorize('admin', 'gestor'), (req, res) => controller.approveGradeSheet(req, res));

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', authorize('admin', 'gestor', 'professor'), (req, res) => controller.create(req, res));
router.put('/:id', authorize('admin', 'gestor', 'professor'), (req, res) => controller.update(req, res));
router.delete('/:id', authorize('admin', 'gestor', 'professor'), (req, res) => controller.delete(req, res));

router.get('/:assessmentId/grades', (req, res) => controller.listGrades(req, res));
router.get('/:assessmentId/grades/my-students', authorize('encarregado'), (req, res) => controller.listGradesByGuardian(req, res));
router.post('/:assessmentId/grades', authorize('admin', 'professor'), (req, res) => controller.saveGrades(req, res));

export default router;
