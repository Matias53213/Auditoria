// src/entities/Proveedor.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, OneToMany } from 'typeorm';
import { Producto } from './producto';

@Entity()
export class Proveedor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreProveedor: string;

  @Column()
  telefonoProveedor: string;

  @Column()
  dniProveedor: string;

  @Column({ nullable: true })
  emailProveedor: string;

  @Column({ nullable: true })
  direccionProveedor: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: Date;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Producto, producto => producto.proveedor)
  productos: Producto[];
}