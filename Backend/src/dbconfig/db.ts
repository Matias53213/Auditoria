import { DataSource } from 'typeorm'
// Nuevas entities
import { Proveedor } from '../models/proveedor'
import { Marca } from '../models/marca'
import { Categoria } from '../models/categoria'
import { Producto } from '../models/producto'
import { User } from '../models/usuario'
import { Pedido } from '../models/pedido'
import { DetallePedido } from '../models/detallePedido'
import { Pago } from '../models/pago'
import { Resena } from '../models/resena'
import { ListaDeseos } from '../models/listaDeseos'

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