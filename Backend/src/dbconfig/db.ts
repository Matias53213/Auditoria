import { DataSource } from 'typeorm'
// Nuevas entities
import { Proveedor } from '../entities/proveedor'
import { Marca } from '../entities/marca'
import { Categoria } from '../entities/categoria'
import { Producto } from '../entities/producto'
import { User } from '../entities/usuario'
import { Pedido } from '../entities/pedido'
import { DetallePedido } from '../entities/detallePedido'
import { Pago } from '../entities/pago'
import { Resena } from '../entities/resena'
import { ListaDeseos } from '../entities/listaDeseos'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    username: "postgres",
    password: "Pass12!",
    port: 5432,
    database: "postgres",
    entities: [
        Proveedor,
        Marca,
        Categoria,
        Producto,
        User,
        Pedido,
        DetallePedido,
        Pago,
        Resena,
        ListaDeseos
    ],
    subscribers: [],
    migrations: [],
    logging: false,
    synchronize: true,
    dropSchema: false,
})