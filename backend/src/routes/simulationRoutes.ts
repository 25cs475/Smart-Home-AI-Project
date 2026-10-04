import { Router } from 'express';
import { triggerScenario, resetSimulation } from '../controllers/simulationController';

const router = Router();

router.post('/scenario/:id', triggerScenario);
router.post('/reset', resetSimulation);

export default router;
