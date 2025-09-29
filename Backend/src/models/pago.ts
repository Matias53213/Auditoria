// src/entities/Pago.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido';
import { User } from './usuario';

@Entity()
export class Pago extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  idPago: string;

  @Column('decimal')
  monto: number;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column()
  metodo: string;

  @Column({ nullable: true })
  fechaPago: Date;

  @ManyToOne(() => Pedido, pedido => pedido.pagos)
  pedido: Pedido;

  @ManyToOne(() => User, usuario => usuario.pagos)
  usuario: User;

  @Column('simple-json', { nullable: true })
  datosTransaccion: any;
}