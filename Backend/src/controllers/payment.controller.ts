import { Request, Response } from 'express';
import { AppDataSource } from '../dbconfig/db';
import { Pago } from '../models/pago';
import { Pedido } from '../models/pedido';
import { sendPaymentConfirmationEmail } from '../services/email.service';

export const registerPayment = async (req: Request, res: Response): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        const { paymentId, orderIds, status, amount } = req.body;

        if (!paymentId || !Array.isArray(orderIds) || orderIds.length === 0 || amount === undefined || isNaN(amount)) {
            throw new Error('Datos de pago inválidos');
        }

        // Obtener los pedidos
        const pedidos = await Promise.all(
            orderIds.map(id => 
                queryRunner.manager.findOne(Pedido, {
                    where: { id: Number(id) },
                    relations: ['usuario', 'detalles']
                })
            )
        );

        if (pedidos.some(p => !p)) {
            throw new Error('Uno o más pedidos no fueron encontrados');
        }

        const existingPayment = await queryRunner.manager.findOne(Pago, {
            where: { idPago: paymentId }
        });

        if (existingPayment) {
            await queryRunner.manager.update(
                Pago,
                { idPago: paymentId },
                {
                    estado: status === 'approved' ? 'aprobado' : 'pendiente',
                    monto: Number(amount),
                    fechaPago: status === 'approved' ? new Date() : existingPayment.fechaPago
                }
            );
        } else {
            await Promise.all(
                orderIds.map(orderId => 
                    queryRunner.manager.save(Pago, {
                        idPago: `${paymentId}-${orderId}`,
                        monto: Number(amount) / orderIds.length,
                        estado: status === 'approved' ? 'aprobado' : 'pendiente',
                        metodo: 'MercadoPago',
                        pedido: { id: Number(orderId) },
                        usuario: { id: pedidos[0]?.usuario.id },
                        datosTransaccion: req.body.datosTransaccion || null
                    })
                )
            );
        }

        if (status === 'approved') {
            await Promise.all(
                orderIds.map(id =>
                    queryRunner.manager.update(
                        Pedido,
                        Number(id),
                        { estado: 'confirmado' }
                    )
                )
            );

            // Enviar correo de confirmación solo si el pago fue aprobado
            const user = pedidos[0]?.usuario;
            if (user && user.email) {
                await sendPaymentConfirmationEmail(
                    user.email,
                    user.username,
                    Number(amount)
                );
            }
        }

        await queryRunner.commitTransaction();
        
        res.status(201).json({
            success: true,
            message: existingPayment ? 'Pago actualizado' : 'Pago registrado',
            orders: pedidos.map(p => ({
                id: p!.id,
                status: status === 'approved' ? 'confirmado' : p!.estado,
                numeroPedido: p!.numeroPedido
            }))
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error en registerPayment:', error);
        
        res.status(500).json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Error al registrar el pago',
        });
    } finally {
        await queryRunner.release();
    }
};

export const getPaymentInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const payment = await AppDataSource.getRepository(Pago).findOne({
            where: { idPago: req.params.paymentId },
            relations: ['pedido', 'usuario', 'pedido.detalles']
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        res.json(payment);
    } catch (error) {
        console.error('Error en getPaymentInfo:', error);
        res.status(500).json({ error: 'Error al obtener el pago' });
    }
};

export const getOrderPayments = async (req: Request, res: Response) => {
    try {
        const payments = await AppDataSource.getRepository(Pago).find({
            where: { pedido: { id: parseInt(req.params.orderId) } },
            relations: ['usuario'],
            order: { fechaPago: 'DESC' }
        });
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pagos del pedido' });
    }
};