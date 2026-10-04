import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController';

const router = Router();

router.get('/', getDashboardOverview);

export default router;
