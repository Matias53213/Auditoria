import { Request, Response } from 'express';
import { Proveedor } from '../models/proveedor';
import { Producto } from '../models/producto';

export const getProveedores = async (req: Request, res: Response) => {
  try {
    console.log('Ejecutando getProveedores...');
    const proveedores = await Proveedor.find({
      relations: ['productos']
    });
    console.log('Proveedores encontrados:', proveedores.length);
    res.json(proveedores);
  } catch (error) {
    console.error('Error en getProveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};


export const getProveedorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const proveedor = await Proveedor.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!proveedor) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedor' });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  const {
    nombreProveedor,
    telefonoProveedor,
    dniProveedor,
    emailProveedor,
    direccionProveedor
  } = req.body;

  try {
    // Verificar si ya existe un proveedor con el mismo DNI
    const proveedorExistente = await Proveedor.findOne({ 
      where: [{ dniProveedor }, { emailProveedor }] 
    });
    
    if (proveedorExistente) {
      res.status(400).json({ message: 'Ya existe un proveedor con ese DNI o email' });
      return;
    }

    const nuevoProveedor = Proveedor.create({
      nombreProveedor,
      telefonoProveedor,
      dniProveedor,
      emailProveedor,
      direccionProveedor,
      fechaRegistro: new Date(),
      activo: true
    });

    await nuevoProveedor.save();
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nombreProveedor,
    telefonoProveedor,
    dniProveedor,
    emailProveedor,
    direccionProveedor,
    activo
  } = req.body;

  try {
    const proveedor = await Proveedor.findOneBy({ id: parseInt(id) });
    if (!proveedor) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }

    // Verificar si el nuevo DNI o email ya existen en otro proveedor
    if (dniProveedor && dniProveedor !== proveedor.dniProveedor) {
      const proveedorExistente = await Proveedor.findOne({ where: { dniProveedor } });
      if (proveedorExistente) {
        res.status(400).json({ message: 'Ya existe un proveedor con ese DNI' });
        return;
      }
    }

    if (emailProveedor && emailProveedor !== proveedor.emailProveedor) {
      const proveedorExistente = await Proveedor.findOne({ where: { emailProveedor } });
      if (proveedorExistente) {
        res.status(400).json({ message: 'Ya existe un proveedor con ese email' });
        return;
      }
    }

    proveedor.nombreProveedor = nombreProveedor || proveedor.nombreProveedor;
    proveedor.telefonoProveedor = telefonoProveedor || proveedor.telefonoProveedor;
    proveedor.dniProveedor = dniProveedor || proveedor.dniProveedor;
    proveedor.emailProveedor = emailProveedor !== undefined ? emailProveedor : proveedor.emailProveedor;
    proveedor.direccionProveedor = direccionProveedor !== undefined ? direccionProveedor : proveedor.direccionProveedor;
    proveedor.activo = activo !== undefined ? activo : proveedor.activo;

    await proveedor.save();
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const proveedor = await Proveedor.findOne({
      where: { id: parseInt(id) },
      relations: ['productos']
    });

    if (!proveedor) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }

    // Verificar si el proveedor tiene productos asociados
    if (proveedor.productos && proveedor.productos.length > 0) {
      res.status(400).json({ 
        message: 'No se puede eliminar el proveedor porque tiene productos asociados' 
      });
      return;
    }

    await Proveedor.remove(proveedor);
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};