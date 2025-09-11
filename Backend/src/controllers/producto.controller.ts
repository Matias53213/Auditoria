// src/controllers/productoController.ts
import { Request, Response } from 'express';
import { Producto } from '../entities/producto';
import { Proveedor } from '../entities/proveedor';
import { Marca } from '../entities/marca';
import { Categoria } from '../entities/categoria';
import { Resena } from '../entities/resena';
import { ListaDeseos } from '../entities/listaDeseos';

export const getProductos = async (req: Request, res: Response) => {
  try {
    console.log('Ejecutando getProductos...');
    const productos = await Producto.find({
      relations: ['proveedor', 'marca', 'categoria', 'resenas', 'listaDeseos']
    });
    console.log('Productos encontrados:', productos.length);
    res.json(productos);
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getProductoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      where: { id: parseInt(id) },
      relations: ['proveedor', 'marca', 'categoria', 'resenas', 'listaDeseos']
    });

    if (!producto) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  const {
    nombre,
    descripcion,
    precio,
    precioOriginal,
    imagenPrincipal,
    imagenesSecundarias,
    proveedorId,
    marcaId,
    categoriaId,
    stock,
    limiteEdicion,
    numeroSerieInicio,
    caracteristicasEspeciales,
    fechaLanzamiento,
    activo
  } = req.body;

  try {
    // Verificar si ya existe un producto con el mismo nombre
    const productoExistente = await Producto.findOne({ where: { nombre } });
    if (productoExistente) {
      res.status(400).json({ message: 'Ya existe un producto con ese nombre' });
      return;
    }

    // Verificar que las entidades relacionadas existan
    const proveedor = await Proveedor.findOneBy({ id: proveedorId });
    if (!proveedor) {
      res.status(400).json({ message: 'Proveedor no encontrado' });
      return;
    }

    const marca = await Marca.findOneBy({ id: marcaId });
    if (!marca) {
      res.status(400).json({ message: 'Marca no encontrada' });
      return;
    }

    const categoria = await Categoria.findOneBy({ id: categoriaId });
    if (!categoria) {
      res.status(400).json({ message: 'Categoría no encontrada' });
      return;
    }

    const nuevoProducto = Producto.create({
      nombre,
      descripcion,
      precio,
      precioOriginal,
      imagenPrincipal,
      imagenesSecundarias,
      proveedor,
      marca,
      categoria,
      stock,
      limiteEdicion,
      numeroSerieInicio,
      caracteristicasEspeciales,
      fechaLanzamiento: fechaLanzamiento ? new Date(fechaLanzamiento) : null,
      activo: activo !== undefined ? activo : true
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    precio,
    precioOriginal,
    imagenPrincipal,
    imagenesSecundarias,
    proveedorId,
    marcaId,
    categoriaId,
    stock,
    limiteEdicion,
    numeroSerieInicio,
    caracteristicasEspeciales,
    fechaLanzamiento,
    activo
  } = req.body;

  try {
    const producto = await Producto.findOne({
      where: { id: parseInt(id) },
      relations: ['proveedor', 'marca', 'categoria']
    });

    if (!producto) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Verificar si el nuevo nombre ya existe en otro producto
    if (nombre && nombre !== producto.nombre) {
      const productoExistente = await Producto.findOne({ where: { nombre } });
      if (productoExistente) {
        res.status(400).json({ message: 'Ya existe un producto con ese nombre' });
        return;
      }
    }

    // Actualizar relaciones si se proporcionan
    if (proveedorId) {
      const proveedor = await Proveedor.findOneBy({ id: proveedorId });
      if (!proveedor) {
        res.status(400).json({ message: 'Proveedor no encontrado' });
        return;
      }
      producto.proveedor = proveedor;
    }

    if (marcaId) {
      const marca = await Marca.findOneBy({ id: marcaId });
      if (!marca) {
        res.status(400).json({ message: 'Marca no encontrada' });
        return;
      }
      producto.marca = marca;
    }

    if (categoriaId) {
      const categoria = await Categoria.findOneBy({ id: categoriaId });
      if (!categoria) {
        res.status(400).json({ message: 'Categoría no encontrada' });
        return;
      }
      producto.categoria = categoria;
    }

    // Actualizar campos
    producto.nombre = nombre || producto.nombre;
    producto.descripcion = descripcion !== undefined ? descripcion : producto.descripcion;
    producto.precio = precio !== undefined ? precio : producto.precio;
    producto.precioOriginal = precioOriginal !== undefined ? precioOriginal : producto.precioOriginal;
    producto.imagenPrincipal = imagenPrincipal !== undefined ? imagenPrincipal : producto.imagenPrincipal;
    producto.imagenesSecundarias = imagenesSecundarias !== undefined ? imagenesSecundarias : producto.imagenesSecundarias;
    producto.stock = stock !== undefined ? stock : producto.stock;
    producto.limiteEdicion = limiteEdicion !== undefined ? limiteEdicion : producto.limiteEdicion;
    producto.numeroSerieInicio = numeroSerieInicio !== undefined ? numeroSerieInicio : producto.numeroSerieInicio;
    producto.caracteristicasEspeciales = caracteristicasEspeciales !== undefined ? caracteristicasEspeciales : producto.caracteristicasEspeciales;
    producto.fechaLanzamiento = fechaLanzamiento ? new Date(fechaLanzamiento) : producto.fechaLanzamiento;
    producto.activo = activo !== undefined ? activo : producto.activo;

    await producto.save();
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      where: { id: parseInt(id) },
      relations: ['detallesPedido', 'resenas', 'listaDeseos']
    });

    if (!producto) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Verificar si el producto tiene relaciones que impidan su eliminación
    if (producto.detallesPedido && producto.detallesPedido.length > 0) {
      res.status(400).json({ 
        message: 'No se puede eliminar el producto porque está asociado a pedidos' 
      });
      return;
    }

    // En lugar de eliminar, podríamos desactivar el producto
    // producto.activo = false;
    // await producto.save();
    // res.json({ message: 'Producto desactivado correctamente' });

    // Eliminar reseñas y lista de deseos asociadas primero
    if (producto.resenas && producto.resenas.length > 0) {
      await Resena.remove(producto.resenas);
    }

    if (producto.listaDeseos && producto.listaDeseos.length > 0) {
      await ListaDeseos.remove(producto.listaDeseos);
    }

    await Producto.remove(producto);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};