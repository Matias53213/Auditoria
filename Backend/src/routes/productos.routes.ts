// routes/producto.routes.ts
import { Router, Request, Response } from 'express';
import express from 'express'; // ✅ AÑADIR ESTA IMPORTACIÓN
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

// --- Multer Configuración ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// --- SERVIR ARCHIVOS ESTÁTICOS ---
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Ruta de subida de imágenes CORREGIDA ---
router.post('/upload', upload.single('imagen'), (req: Request, res: Response) => {
  const reqWithFile = req as MulterRequest;

  if (!reqWithFile.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }

  // URL relativa para usar en el frontend
  const url = `/uploads/${reqWithFile.file.filename}`;
  res.status(201).json({ url });
});

// --- Rutas de productos ---
router.get('/productos', getProductos);
router.get('/productos/:id', getProductoById);
router.post('/productos', createProducto);
router.put('/productos/:id', updateProducto);
router.delete('/productos/:id', deleteProducto);

export default router;