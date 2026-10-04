import { Router } from 'express';
import { getEnergyAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/energy', getEnergyAnalytics);

export default router;
