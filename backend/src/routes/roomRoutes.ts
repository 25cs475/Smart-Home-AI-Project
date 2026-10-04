import { Router } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoomEnvironment,
  deleteRoom
} from '../controllers/roomController';

const router = Router();

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', createRoom);
router.put('/:id/environment', updateRoomEnvironment);
router.delete('/:id', deleteRoom);

export default router;
