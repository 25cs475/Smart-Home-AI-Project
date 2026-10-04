import { Router } from 'express';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import roomRoutes from './roomRoutes';
import deviceRoutes from './deviceRoutes';
import preferenceRoutes from './preferenceRoutes';
import aiRoutes from './aiRoutes';
import conflictRoutes from './conflictRoutes';
import analyticsRoutes from './analyticsRoutes';
import simulationRoutes from './simulationRoutes';
import settingsRoutes from './settingsRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/rooms', roomRoutes);
router.use('/devices', deviceRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/ai', aiRoutes);
router.use('/conflicts', conflictRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/simulation', simulationRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

// Direct compatibility alias for /api/frames
router.use('/frames', aiRoutes);
router.use('/decisions', aiRoutes);

export default router;
