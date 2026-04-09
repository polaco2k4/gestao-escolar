import { Router } from 'express';
import { HorariosController } from './horarios.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/roles';

const router = Router();
const controller = new HorariosController();

router.use(authenticate);

router.get('/schedules', controller.listSchedules);
router.get('/schedules/:id', controller.getScheduleById);
router.post('/schedules', authorize('admin'), controller.createSchedule);
router.put('/schedules/:id', authorize('admin'), controller.updateSchedule);
router.delete('/schedules/:id', authorize('admin'), controller.deleteSchedule);

router.get('/classes', controller.listClasses);
router.get('/classes/:id', controller.getClassById);
router.post('/classes', authorize('admin'), controller.createClass);
router.put('/classes/:id', authorize('admin'), controller.updateClass);

router.get('/subjects', controller.listSubjects);
router.post('/subjects', authorize('admin'), controller.createSubject);
router.put('/subjects/:id', authorize('admin'), controller.updateSubject);

router.get('/rooms', controller.listRooms);
router.post('/rooms', authorize('admin'), controller.createRoom);
router.put('/rooms/:id', authorize('admin'), controller.updateRoom);

router.get('/by-class/:classId', controller.getScheduleByClass);
router.get('/by-teacher/:teacherId', controller.getScheduleByTeacher);

export default router;
