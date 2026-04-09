import { Router } from 'express';
import { AcademicYearsController } from './academicYears.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new AcademicYearsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/current', controller.getCurrent);
router.get('/:id', controller.getById);

export default router;
