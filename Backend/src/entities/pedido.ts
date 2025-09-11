// src/entities/Pedido.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './usuario';
import { DetallePedido } from './detallePedido';
import { Pago } from './pago';

@Entity()
export class Pedido extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numeroPedido: string;

  @Column('decimal')
  precioTotal: number;

  @Column({ default: 'pendiente' })
  estado: string;

  @ManyToOne(() => User, usuario => usuario.pedidos)
  usuario: User;

  @Column({ type: 'text' })
  direccionEnvio: string;

  @Column({ type: 'text' })
  direccionFacturacion: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @OneToMany(() => DetallePedido, detalle => detalle.pedido)
  detalles: DetallePedido[];

  @OneToMany(() => Pago, pago => pago.pedido)
  pagos: Pago[];
}