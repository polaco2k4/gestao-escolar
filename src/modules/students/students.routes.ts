import { Router } from 'express';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import { validate } from '../../middleware/validate';
import { createStudentSchema, updateStudentSchema } from './students.validation';
import { checkResourceLimit } from '../../middleware/licenseCheck';

const router = Router();
const controller = new StudentsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/my-students', authorize('encarregado'), controller.listByGuardian);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'gestor'), checkResourceLimit('students'), validate(createStudentSchema), controller.create);
router.put('/:id', authorize('admin', 'gestor'), validate(updateStudentSchema), controller.update);
router.patch('/:id/toggle-active', authorize('admin', 'gestor'), controller.toggleActive);
router.delete('/:id', authorize('admin', 'gestor'), controller.delete);

export default router;
