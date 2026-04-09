import { Router } from 'express';
import { TeachersController } from './teachers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new TeachersController();

router.use(authenticate);

router.get('/', (req, res) => controller.list(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
