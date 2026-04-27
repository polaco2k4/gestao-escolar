import { Router } from 'express';
import { HorariosController } from './horarios.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new HorariosController();

router.use(authenticate);

router.get('/schedules', controller.listSchedules);
router.get('/schedules/:id', controller.getScheduleById);
router.post('/schedules', authorize('admin', 'gestor'), controller.createSchedule);
router.put('/schedules/:id', authorize('admin', 'gestor'), controller.updateSchedule);
router.delete('/schedules/:id', authorize('admin', 'gestor'), controller.deleteSchedule);

router.get('/classes', controller.listClasses);
router.get('/classes/:id', controller.getClassById);
router.post('/classes', authorize('admin', 'gestor'), controller.createClass);
router.put('/classes/:id', authorize('admin', 'gestor'), controller.updateClass);

router.get('/subjects', controller.listSubjects);
router.post('/subjects', authorize('admin', 'gestor'), controller.createSubject);
router.put('/subjects/:id', authorize('admin', 'gestor'), controller.updateSubject);

router.get('/rooms', controller.listRooms);
router.post('/rooms', authorize('admin', 'gestor'), controller.createRoom);
router.put('/rooms/:id', authorize('admin', 'gestor'), controller.updateRoom);
router.delete('/rooms/:id', authorize('admin', 'gestor'), controller.deleteRoom);

router.get('/by-class/:classId', controller.getScheduleByClass);
router.get('/by-teacher/:teacherId', controller.getScheduleByTeacher);

export default router;
