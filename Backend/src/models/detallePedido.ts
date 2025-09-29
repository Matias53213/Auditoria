// src/entities/DetallePedido.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido';
import { Producto } from './producto';

@Entity()
export class DetallePedido extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, pedido => pedido.detalles)
  pedido: Pedido;

  @ManyToOne(() => Producto, producto => producto.detallesPedido)
  producto: Producto;

  @Column()
  cantidad: number;

  @Column('decimal')
  precioUnitario: number;

  @Column('decimal')
  subtotal: number;
}