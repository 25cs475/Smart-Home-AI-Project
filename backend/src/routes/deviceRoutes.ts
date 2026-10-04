import { Router } from 'express';
import {
  getAllDevices,
  setManualOverride,
  releaseManualOverride,
  toggleDeviceStatus
} from '../controllers/deviceController';

const router = Router();

router.get('/', getAllDevices);
router.put('/:id/override', setManualOverride);
router.put('/:id/release-override', releaseManualOverride);
router.put('/:id/status', toggleDeviceStatus);

export default router;
