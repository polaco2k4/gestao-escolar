import { Router } from 'express';
import { ClassesController } from './classes.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new ClassesController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;
