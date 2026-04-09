import { Router } from 'express';
import { SchoolsController } from './schools.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new SchoolsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.get('/:id/stats', controller.getStats);
router.post('/', authorize('admin'), controller.create);
router.put('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

export default router;
