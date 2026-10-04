import { Router } from 'express';
import {
  getAllPreferences,
  createPreference,
  updatePreference,
  deletePreference
} from '../controllers/preferenceController';

const router = Router();

router.get('/', getAllPreferences);
router.post('/', createPreference);
router.put('/:id', updatePreference);
router.delete('/:id', deletePreference);

export default router;
