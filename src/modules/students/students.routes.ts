import { Router } from 'express';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import { validate } from '../../middleware/validate';
import { createStudentSchema, updateStudentSchema } from './students.validation';

const router = Router();
const controller = new StudentsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin'), validate(createStudentSchema), controller.create);
router.put('/:id', authorize('admin'), validate(updateStudentSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

export default router;
