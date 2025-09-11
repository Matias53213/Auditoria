// src/entities/Marca.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, OneToMany } from 'typeorm';
import { Producto } from './producto';

@Entity()
export class Marca extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  logoUrl: string;

  @OneToMany(() => Producto, producto => producto.marca)
  productos: Producto[];
}