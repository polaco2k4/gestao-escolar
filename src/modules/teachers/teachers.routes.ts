import { Router } from 'express';
import { TeachersController } from './teachers.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import { checkResourceLimit } from '../../middleware/licenseCheck';

const router = Router();
const controller = new TeachersController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', authorize('admin', 'gestor'), checkResourceLimit('teachers'), (req, res) => controller.create(req, res));
router.put('/:id', authorize('admin', 'gestor'), (req, res) => controller.update(req, res));
router.delete('/:id', authorize('admin', 'gestor'), (req, res) => controller.delete(req, res));

export default router;
