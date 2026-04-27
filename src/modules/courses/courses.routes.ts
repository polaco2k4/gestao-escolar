import { Router } from 'express';
import { CoursesController } from './courses.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new CoursesController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'gestor'), controller.create);
router.put('/:id', authorize('admin', 'gestor'), controller.update);
router.delete('/:id', authorize('admin', 'gestor'), controller.delete);

export default router;
