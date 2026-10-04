import { Router } from 'express';
import {
  runAiAnalysis,
  getCurrentSituationFrame,
  getFrameHierarchy,
  getDecisionHistory,
  getRules
} from '../controllers/aiController';

const router = Router();

router.post('/analyze', runAiAnalysis);
router.get('/frames/current', getCurrentSituationFrame);
router.get('/frames/hierarchy', getFrameHierarchy);
router.get('/decisions', getDecisionHistory);
router.get('/rules', getRules);

export default router;
