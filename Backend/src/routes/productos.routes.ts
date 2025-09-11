import { Router, Request, Response } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/producto.controller';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Express } from 'express';

const router = Router();

// --- Multer Configuración (la tuya, intacta) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// --- Ruta de subida de imágenes (igual que la tuya) ---
router.post('/upload', upload.single('imagen'), (req: Request, res: Response) => {
  const reqWithFile = req as MulterRequest;

  if (!reqWithFile.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  const url = `/uploads/${reqWithFile.file.filename}`;
  res.status(201).json({ url });
});

// --- Rutas de productos usando tu controller ---
router.get('/productos', getProductos);
router.get('/productos/:id', getProductoById);
router.post('/productos', createProducto);
router.put('/productos/:id', updateProducto);
router.delete('/productos/:id', deleteProducto);
export default router;
