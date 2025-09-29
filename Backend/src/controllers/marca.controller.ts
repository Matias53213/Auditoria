// src/controllers/marcaController.ts
import { Request, Response } from 'express';
import { Marca } from '../models/marca';
import { Producto } from '../models/producto';

export const getMarcas = async (req: Request, res: Response) => {
  try {
    const marcas = await Marca.find({
      relations: ['productos']
    });
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener marcas' });
  }
};

export const getMarcaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const marca = await Marca.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!marca) {
      res.status(404).json({ message: 'Marca no encontrada' });
      return;
    }

    res.json(marca);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener marca' });
  }
};

export const createMarca = async (req: Request, res: Response) => {
  const { nombre, descripcion, logoUrl } = req.body;

  try {
    const marcaExistente = await Marca.findOne({ where: { nombre } });
    if (marcaExistente) {
      res.status(400).json({ message: 'Ya existe una marca con ese nombre' });
      return;
    }

    const nuevaMarca = Marca.create({
      nombre,
      descripcion,
      logoUrl
    });

    await nuevaMarca.save();
    res.status(201).json(nuevaMarca);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear marca' });
  }
};

export const updateMarca = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, logoUrl } = req.body;

  try {
    const marca = await Marca.findOneBy({ id: parseInt(id) });
    if (!marca) {
      res.status(404).json({ message: 'Marca no encontrada' });
      return;
    }

    // Verificar si el nuevo nombre ya existe en otra marca
    if (nombre && nombre !== marca.nombre) {
      const marcaExistente = await Marca.findOne({ where: { nombre } });
      if (marcaExistente) {
        res.status(400).json({ message: 'Ya existe una marca con ese nombre' });
        return;
      }
    }

    marca.nombre = nombre || marca.nombre;
    marca.descripcion = descripcion !== undefined ? descripcion : marca.descripcion;
    marca.logoUrl = logoUrl !== undefined ? logoUrl : marca.logoUrl;

    await marca.save();
    res.json(marca);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar marca' });
  }
};

export const deleteMarca = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const marca = await Marca.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!marca) {
      res.status(404).json({ message: 'Marca no encontrada' });
      return;
    }

    // Verificar si la marca tiene productos asociados
    if (marca.productos && marca.productos.length > 0) {
      res.status(400).json({ 
        message: 'No se puede eliminar la marca porque tiene productos asociados' 
      });
      return;
    }

    await Marca.remove(marca);
    res.json({ message: 'Marca eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar marca' });
  }
};