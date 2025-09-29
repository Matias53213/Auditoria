// src/entities/ListaDeseos.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne, Unique } from 'typeorm';
import { User } from './usuario';
import { Producto } from './producto';

@Entity()
@Unique(['usuario', 'producto'])
export class ListaDeseos extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, usuario => usuario.listaDeseos)
  usuario: User;

  @ManyToOne(() => Producto, producto => producto.listaDeseos)
  producto: Producto;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  fechaAgregado: Date;
}