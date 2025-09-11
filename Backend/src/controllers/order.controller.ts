import { Request, Response } from 'express';
import { AppDataSource } from '../dbconfig/db';
import { Pedido } from '../entities/pedido';
import { DetallePedido } from '../entities/detallePedido';
import { Usuario } from '../entities/usuario';
import { Producto } from '../entities/producto';

// Función para generar un número de pedido único
const generateOrderNumber = (): string => {
  return `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const createOrder = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const { userId, productos } = req.body;

        if (!Array.isArray(productos)) {
            throw new Error('El formato de productos es incorrecto');
        }

        const userExists = await queryRunner.manager.count(Usuario, { where: { id: userId } });
        if (!userExists) {
            throw new Error(`El usuario con ID ${userId} no existe`);
        }

        // Obtener datos del usuario para las direcciones
        const user = await queryRunner.manager.findOne(Usuario, { where: { id: userId } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Crear un nuevo pedido
        const pedido = new Pedido();
        pedido.numeroPedido = generateOrderNumber();
        pedido.precioTotal = 0;
        pedido.estado = 'pendiente';
        pedido.usuario = user;
        pedido.direccionEnvio = user.direccionEnvio || '';
        pedido.direccionFacturacion = user.direccionFacturacion || '';

        const savedPedido = await queryRunner.manager.save(pedido);
        let totalPrice = 0;
        const createdOrderDetails = [];
        
        for (const productoItem of productos) {
            const { productoId, cantidad } = productoItem;

            // Verificar si el producto existe
            const producto = await queryRunner.manager.findOne(Producto, { 
                where: { id: productoId } 
            });
            
            if (!producto) {
                throw new Error(`El producto con ID ${productoId} no existe`);
            }

            if (producto.stock < cantidad) {
                throw new Error(`Stock insuficiente para el producto: ${producto.nombre}`);
            }

            const precioNumerico = Number(producto.precio);
            if (isNaN(precioNumerico)) {
                throw new Error('El precio debe ser un número válido');
            }

            const subtotal = precioNumerico * cantidad;

            // Crear detalle de pedido
            const detallePedido = new DetallePedido();
            detallePedido.pedido = savedPedido;
            detallePedido.producto = producto;
            detallePedido.cantidad = cantidad;
            detallePedido.precioUnitario = precioNumerico;
            detallePedido.subtotal = subtotal;
            
            const result = await queryRunner.manager.save(detallePedido);
            
            // Actualizar stock del producto
            producto.stock -= cantidad;
            await queryRunner.manager.save(Producto, producto);
            
            totalPrice += subtotal;
            createdOrderDetails.push({
                id: result.id,
                productoId,
                cantidad,
                precioUnitario: precioNumerico,
                subtotal
            });
        }

        // Actualizar el precio total del pedido
        savedPedido.precioTotal = totalPrice;
        await queryRunner.manager.save(Pedido, savedPedido);

        await queryRunner.commitTransaction();
        
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            detalles: createdOrderDetails,
            pedidoId: savedPedido.id,
            numeroPedido: savedPedido.numeroPedido,
            total: totalPrice
        });

    } catch (error: unknown) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof Error) {
            console.error('Error al crear pedido:', {
                message: error.message,
                ...(error as any).query && { query: (error as any).query },
                ...(error as any).parameters && { parameters: (error as any).parameters }
            });
            
            res.status(500).json({ 
                error: 'Error al crear el pedido',
                detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            console.error('Error desconocido al crear pedido:', error);
            res.status(500).json({ error: 'Error desconocido al crear el pedido' });
        }
    } finally {
        await queryRunner.release();
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const pedido = await AppDataSource.getRepository(Pedido).findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['usuario', 'detalles', 'detalles.producto', 'pagos']
        });

        if (!pedido) {
            res.status(404).json({ error: 'Pedido no encontrado' });
            return;
        }

        res.json(pedido);
    } catch (error) {
        console.error('Error en getOrderById:', error);
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const pedidos = await AppDataSource.getRepository(Pedido).find({
      where: { usuario: { id: parseInt(req.params.userId) } },
      relations: ['detalles', 'detalles.producto'],
      order: { id: 'DESC' }
    });

    res.json(pedidos);
  } catch (error) {
    console.error('Error en getUserOrders:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const pedidos = await AppDataSource.getRepository(Pedido).find({
            relations: ['usuario', 'detalles', 'detalles.producto', 'pagos'],
            order: { id: 'DESC' }
        });
        
        res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        res.status(500).json({ 
            error: 'Error al obtener pedidos',
        });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const pedido = await queryRunner.manager.findOne(Pedido, {
      where: { id: parseInt(req.params.id) },
      relations: ['detalles', 'detalles.producto']
    });

    if (!pedido) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    // Restaurar stock de productos si el pedido se cancela
    if (pedido.estado !== 'cancelado') {
      for (const detalle of pedido.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: detalle.producto.id }
        });
        if (producto) {
          producto.stock += detalle.cantidad;
          await queryRunner.manager.save(Producto, producto);
        }
      }
    }

    // Actualizar el estado del pedido a 'cancelado'
    pedido.estado = 'cancelado';
    await queryRunner.manager.save(Pedido, pedido);

    await queryRunner.commitTransaction();
    
    res.json({ message: 'Pedido cancelado exitosamente' });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error en cancelOrder:', error);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  } finally {
    await queryRunner.release();
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        await AppDataSource.getRepository(Pedido).update(id, { 
            estado: 'confirmado' 
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al confirmar pedido' });
    }
};