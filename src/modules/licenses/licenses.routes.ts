import { Router } from 'express';
import { LicensesController } from './licenses.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new LicensesController();

router.use(authenticate);

// ============ PLANOS (Admin apenas) ============
router.get('/plans', authorize('admin'), controller.listPlans);
router.get('/plans/:id', authorize('admin'), controller.getPlanById);
router.post('/plans', authorize('admin'), controller.createPlan);
router.put('/plans/:id', authorize('admin'), controller.updatePlan);

// ============ VERIFICAÇÃO E ESTATÍSTICAS (rotas específicas primeiro) ============
router.get('/stats/global', authorize('admin'), controller.getGlobalStats);
router.get('/check/:schoolId', authorize('admin', 'gestor'), controller.checkLimits);
router.get('/usage/:schoolId', authorize('admin', 'gestor'), controller.getUsage);
router.get('/school/:schoolId', authorize('admin', 'gestor'), controller.getLicenseBySchoolId);

// ============ LICENÇAS ============
router.get('/', authorize('admin', 'gestor'), controller.listLicenses);
router.get('/:id', authorize('admin', 'gestor'), controller.getLicenseById);
router.post('/', authorize('admin'), controller.createLicense);
router.put('/:id', authorize('admin'), controller.updateLicense);
router.delete('/:id', authorize('admin'), controller.deleteLicense);

export default router;
