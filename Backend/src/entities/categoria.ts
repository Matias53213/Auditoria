// src/entities/Categoria.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, OneToMany } from 'typeorm';
import { Producto } from './producto';

@Entity()
export class Categoria extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => Producto, producto => producto.categoria)
  productos: Producto[];
}