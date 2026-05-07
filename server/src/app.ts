import express from 'express';
import { NODE_ENV, PORT } from './config';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as actividadesRouter } from './features/actividades/actividades.router';
import { router as asistenciasRouter } from './features/asistencias/asistencias.router';
import { router as interaccionesRouter } from './features/interacciones/interacciones.router';
import { initDb } from './config/database';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/actividades', actividadesRouter);
app.use('/api/asistencias', asistenciasRouter);
app.use('/api/interacciones', interaccionesRouter);

app.use(errorsMiddleware);

const start = async () => {
  await initDb();
  if (NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log('Server is running on http://localhost:' + PORT);
    });
  }
};

start();

export default app;
