// src/controllers/resenaController.ts
import { Request, Response } from 'express';
import { Resena } from '../entities/resena';
import { User } from '../entities/usuario';
import { Producto } from '../entities/producto';

export const getResenas = async (req: Request, res: Response) => {
  try {
    const resenas = await Resena.find({
      relations: ['usuario', 'producto']
    });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

export const getResenaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resena = await Resena.findOne({
      where: { id: parseInt(id) },
      relations: ['usuario', 'producto']
    });

    if (!resena) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    res.json(resena);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseña' });
  }
};

export const createResena = async (req: Request, res: Response) => {
  const { usuarioId, productoId, calificacion, comentario } = req.body;

  try {
    // Verificar que el usuario existe
    const usuario = await User.findOneBy({ id: usuarioId });
    if (!usuario) {
      res.status(400).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Verificar que el producto existe
    const producto = await Producto.findOneBy({ id: productoId });
    if (!producto) {
      res.status(400).json({ message: 'Producto no encontrado' });
      return;
    }

    // Verificar si el usuario ya ha reseñado este producto
    const resenaExistente = await Resena.findOne({ 
      where: { usuario: { id: usuarioId }, producto: { id: productoId } } 
    });
    
    if (resenaExistente) {
      res.status(400).json({ message: 'Ya has reseñado este producto' });
      return;
    }

    const nuevaResena = Resena.create({
      usuario,
      producto,
      calificacion,
      comentario,
      aprobada: false // Por defecto, las reseñas no están aprobadas
    });

    await nuevaResena.save();
    res.status(201).json(nuevaResena);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reseña' });
  }
};

export const updateResena = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { calificacion, comentario, aprobada } = req.body;

  try {
    const resena = await Resena.findOne({
      where: { id: parseInt(id) },
      relations: ['usuario', 'producto']
    });

    if (!resena) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    resena.calificacion = calificacion !== undefined ? calificacion : resena.calificacion;
    resena.comentario = comentario !== undefined ? comentario : resena.comentario;
    resena.aprobada = aprobada !== undefined ? aprobada : resena.aprobada;

    await resena.save();
    res.json(resena);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar reseña' });
  }
};

export const deleteResena = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resena = await Resena.findOneBy({ id: parseInt(id) });

    if (!resena) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    await Resena.remove(resena);
    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reseña' });
  }
};