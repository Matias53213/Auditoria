// src/entities/Resena.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne } from 'typeorm';
import { User } from './usuario';
import { Producto } from './producto';

@Entity()
export class Resena extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, usuario => usuario.resenas)
  usuario: User;

  @ManyToOne(() => Producto, producto => producto.resenas)
  producto: Producto;

  @Column()
  calificacion: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ default: false })
  aprobada: boolean;
}