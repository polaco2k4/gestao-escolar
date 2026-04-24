import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new FinanceiroController();

router.use(authenticate);

router.get('/fee-types', controller.listFeeTypes);
router.post('/fee-types', authorize('admin'), controller.createFeeType);
router.put('/fee-types/:id', authorize('admin'), controller.updateFeeType);
router.delete('/fee-types/:id', authorize('admin'), controller.deleteFeeType);

router.get('/student-fees', controller.listStudentFees);
router.get('/student-fees/student/:studentId', controller.getStudentFees);
router.post('/student-fees', authorize('admin'), controller.createStudentFee);
router.post('/student-fees/bulk', authorize('admin'), controller.bulkCreateStudentFees);

router.get('/payments', controller.listPayments);
router.get('/payments/:id', controller.getPaymentById);
router.post('/payments', authorize('admin'), controller.createPayment);

router.get('/summary', authorize('admin'), controller.getFinancialSummary);

export default router;
