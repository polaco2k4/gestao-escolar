import { Router } from 'express';
import { SubjectsController } from './subjects.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new SubjectsController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', authorize('admin'), (req, res) => controller.create(req, res));
router.put('/:id', authorize('admin'), (req, res) => controller.update(req, res));
router.delete('/:id', authorize('admin'), (req, res) => controller.delete(req, res));

export default router;
