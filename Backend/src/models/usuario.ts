// src/entities/Usuario.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, OneToMany } from 'typeorm';
import { Pedido } from './pedido';
import { Resena } from './resena';
import { ListaDeseos } from './listaDeseos';
import { Pago } from './pago';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  dni: string;

  @Column({ default: false })
  admin: boolean;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: false })
  confirmacion: boolean;

  @Column({ type: 'varchar', length: 6, nullable: true })
  confirmationCode: string | null; // <-- Nuevo campo para el código

  @Column({ type: 'text', nullable: true })
  direccionEnvio: string;

  @Column({ type: 'text', nullable: true })
  direccionFacturacion: string;

  @OneToMany(() => Pedido, pedido => pedido.usuario)
  pedidos: Pedido[];

  @OneToMany(() => Resena, resena => resena.usuario)
  resenas: Resena[];

  @OneToMany(() => ListaDeseos, listaDeseos => listaDeseos.usuario)
  listaDeseos: ListaDeseos[];

  @OneToMany(() => Pago, pago => pago.usuario)
  pagos: Pago[];
}