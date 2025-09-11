// src/controllers/categoriaController.ts
import { Request, Response } from 'express';
import { Categoria } from '../entities/categoria';
import { Producto } from '../entities/producto';

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.find({
      relations: ['productos']
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

export const getCategoriaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const categoria = await Categoria.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!categoria) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categoría' });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body;

  try {
    const categoriaExistente = await Categoria.findOne({ where: { nombre } });
    if (categoriaExistente) {
      res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      return;
    }

    const nuevaCategoria = Categoria.create({
      nombre,
      descripcion
    });

    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

export const updateCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const categoria = await Categoria.findOneBy({ id: parseInt(id) });
    if (!categoria) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    if (nombre && nombre !== categoria.nombre) {
      const categoriaExistente = await Categoria.findOne({ where: { nombre } });
      if (categoriaExistente) {
        res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
        return;
      }
    }

    categoria.nombre = nombre || categoria.nombre;
    categoria.descripcion = descripcion !== undefined ? descripcion : categoria.descripcion;

    await categoria.save();
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

export const deleteCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const categoria = await Categoria.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!categoria) {
      res.status(404).json({ message: 'Categoría no encontrada' });
      return;
    }

    // Verificar si la categoría tiene productos asociados
    if (categoria.productos && categoria.productos.length > 0) {
      res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
      return;
    }

    await Categoria.remove(categoria);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};