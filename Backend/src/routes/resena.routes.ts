import { Router } from 'express';
import {
  getResenas,
  getResenaById,
  createResena,
  updateResena,
  deleteResena
} from '../controllers/resena.controller';

const router = Router();
router.get('/resenas', getResenas);
router.get('/resenas/:id', getResenaById);
router.post('/resenas', createResena);
router.put('/resenas/:id', updateResena);
router.delete('/resenas/:id', deleteResena);

export default router;
