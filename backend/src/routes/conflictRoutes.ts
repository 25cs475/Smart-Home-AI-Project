import { Router } from 'express';
import {
  getConflictHistory,
  previewConflictStrategies,
  resolveConflict
} from '../controllers/conflictController';

const router = Router();

router.get('/', getConflictHistory);
router.post('/preview', previewConflictStrategies);
router.post('/resolve', resolveConflict);

export default router;
