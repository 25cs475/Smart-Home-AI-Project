import { Router } from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notificationController';

const router = Router();

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

export default router;
