import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import MarcaRoutes from "./routes/marca.routes"
import CategoriaRoutes from "./routes/categoria.routes"
import listaDeseosRoutes from "./routes/listaDeseo.routes"
import ProductosRoutes from "./routes/productos.routes"
import ProveedorRoutes from "./routes/proveedor.routes"
import ResenaRoutes from "./routes/resena.routes"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import { confirmAccount } from './controllers/auth.controller';
import path from 'path';
import { AppDataSource } from './dbconfig/db';
import { Marca } from './models/marca';
import { Resena } from './models/resena';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use("/api", MarcaRoutes);
app.use("/api", CategoriaRoutes)
app.use("/api", listaDeseosRoutes)
app.use("/api", ProductosRoutes)
app.use("/api", ProveedorRoutes)
app.use("/api", ResenaRoutes)
app.use("/api", authRoutes)
app.use("/api", userRoutes)
app.post('/api/confirm', confirmAccount); // Asegúrate de tener esta línea

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/check', (_req, res) => {
  res.send('¡El servidor está funcionando!');
});

export default app;