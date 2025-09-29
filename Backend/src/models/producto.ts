// src/entities/Producto.ts
import { PrimaryGeneratedColumn, BaseEntity, Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Proveedor } from './proveedor';
import { Marca } from './marca';
import { Categoria } from './categoria';
import { DetallePedido } from './detallePedido';
import { Resena } from './resena';
import { ListaDeseos } from './listaDeseos';

@Entity()
export class Producto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal')
  precio: number;

  @Column('decimal', { nullable: true })
  precioOriginal: number;

  @Column({ nullable: true })
  imagenPrincipal: string;

  @Column('simple-array', { nullable: true })
  imagenesSecundarias: string[];

  @ManyToOne(() => Proveedor, proveedor => proveedor.productos)
  proveedor: Proveedor;

  @ManyToOne(() => Marca, marca => marca.productos)
  marca: Marca;

  @ManyToOne(() => Categoria, categoria => categoria.productos)
  categoria: Categoria;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  limiteEdicion: number;

  @Column({ nullable: true })
  numeroSerieInicio: number;

  @Column('simple-json', { nullable: true })
  caracteristicasEspeciales: any;

  @Column({ type: 'timestamp', nullable: true })
  fechaLanzamiento?: Date | null;

  @Column({ default: true })
  activo: boolean;

  @Column ({default: false})
  destacado: boolean;

  @OneToMany(() => DetallePedido, detalle => detalle.producto)
  detallesPedido: DetallePedido[];

  @OneToMany(() => Resena, resena => resena.producto)
  resenas: Resena[];

  @OneToMany(() => ListaDeseos, listaDeseos => listaDeseos.producto)
  listaDeseos: ListaDeseos[];

}