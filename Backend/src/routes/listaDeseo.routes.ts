import { Router } from 'express';
import {
  getListaDeseosByUsuario,
  addToListaDeseos,
  removeFromListaDeseos,
  deleteListaDeseosByUsuarioAndProducto
} from '../controllers/listaDeseo.controller';

const router = Router();
router.get('/lista-deseos/:usuarioId', getListaDeseosByUsuario);
router.post('/lista-deseos', addToListaDeseos);
router.delete('/lista-deseos/:id', removeFromListaDeseos);
router.delete('/lista-deseos/:usuarioId/:productoId', deleteListaDeseosByUsuarioAndProducto);
export default router;
