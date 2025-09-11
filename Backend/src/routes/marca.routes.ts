import { Router } from 'express';
import {
  getMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
} from '../controllers/marca.controller';

const router = Router();
router.get('/marcas', getMarcas);
router.get('/marcas/:id', getMarcaById);
router.post('/marcas', createMarca);
router.put('/marcas/:id', updateMarca);
router.delete('/marcas/:id', deleteMarca);

export default router;
