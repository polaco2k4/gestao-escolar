import { Router } from 'express';
import { ComunicacaoController } from './comunicacao.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new ComunicacaoController();

router.use(authenticate);

router.get('/messages', controller.listMessages);
router.get('/messages/:id', controller.getMessageById);
router.post('/messages', controller.sendMessage);
router.delete('/messages/:id', controller.deleteMessage);

router.get('/notifications', controller.listNotifications);
router.put('/notifications/:id/read', controller.markAsRead);
router.put('/notifications/read-all', controller.markAllAsRead);

export default router;
