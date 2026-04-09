import { Router } from 'express';
import { MatriculasController } from './matriculas.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';
import { validate } from '../../middleware/validate';
import { createEnrollmentSchema, transferSchema } from './matriculas.validation';

const router = Router();
const controller = new MatriculasController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin'), validate(createEnrollmentSchema), controller.create);
router.put('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

router.post('/transfers', authorize('admin'), validate(transferSchema), controller.createTransfer);
router.get('/transfers/list', authorize('admin'), controller.listTransfers);
router.put('/transfers/:id/approve', authorize('admin'), controller.approveTransfer);

export default router;
