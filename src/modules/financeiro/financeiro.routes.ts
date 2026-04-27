import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new FinanceiroController();

router.use(authenticate);

router.get('/fee-types', controller.listFeeTypes);
router.post('/fee-types', authorize('admin', 'gestor'), controller.createFeeType);
router.put('/fee-types/:id', authorize('admin', 'gestor'), controller.updateFeeType);
router.delete('/fee-types/:id', authorize('admin', 'gestor'), controller.deleteFeeType);

router.get('/student-fees', controller.listStudentFees);
router.get('/student-fees/student/:studentId', controller.getStudentFees);
router.post('/student-fees', authorize('admin', 'gestor'), controller.createStudentFee);
router.post('/student-fees/bulk', authorize('admin', 'gestor'), controller.bulkCreateStudentFees);

router.get('/payments', controller.listPayments);
router.get('/payments/:id', controller.getPaymentById);
router.post('/payments', authorize('admin', 'gestor'), controller.createPayment);

router.get('/summary', authorize('admin', 'gestor'), controller.getFinancialSummary);

export default router;
