// src/controllers/listaDeseosController.ts
import { Request, Response } from 'express';
import { ListaDeseos } from '../entities/listaDeseos';
import { User } from '../entities/usuario';
import { Producto } from '../entities/producto';

export const getListaDeseosByUsuario = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

  try {
    const listaDeseos = await ListaDeseos.find({
      where: { usuario: { id: parseInt(usuarioId) } },
      relations: ['producto', 'usuario']
    });

    res.json(listaDeseos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener lista de deseos' });
  }
};

export const addToListaDeseos = async (req: Request, res: Response) => {
  const { usuarioId, productoId } = req.body;

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

    // Verificar si el producto ya está en la lista de deseos del usuario
    const itemExistente = await ListaDeseos.findOne({ 
      where: { usuario: { id: usuarioId }, producto: { id: productoId } } 
    });
    
    if (itemExistente) {
      res.status(400).json({ message: 'El producto ya está en tu lista de deseos' });
      return;
    }

    const nuevoItem = ListaDeseos.create({
      usuario,
      producto,
      fechaAgregado: new Date()
    });

    await nuevoItem.save();
    res.status(201).json(nuevoItem);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar a lista de deseos' });
  }
};

export const removeFromListaDeseos = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await ListaDeseos.findOneBy({ id: parseInt(id) });
    if (!item) {
      res.status(404).json({ message: 'Ítem no encontrado en la lista de deseos' });
      return;
    }

    await ListaDeseos.remove(item);
    res.json({ message: 'Ítem eliminado de la lista de deseos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar de la lista de deseos' });
  }
};

export const deleteListaDeseosByUsuarioAndProducto = async (req: Request, res: Response) => {
  const { usuarioId, productoId } = req.params;

  try {
    const item = await ListaDeseos.findOne({
      where: { 
        usuario: { id: parseInt(usuarioId) }, 
        producto: { id: parseInt(productoId) } 
      }
    });

    if (!item) {
      res.status(404).json({ message: 'Ítem no encontrado en la lista de deseos' });
      return;
    }

    await ListaDeseos.remove(item);
    res.json({ message: 'Ítem eliminado de la lista de deseos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar de la lista de deseos' });
  }
};