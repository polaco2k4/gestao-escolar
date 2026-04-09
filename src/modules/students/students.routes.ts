import { Router } from 'express';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new StudentsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;
