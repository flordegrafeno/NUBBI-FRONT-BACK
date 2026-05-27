import express from "express";
import { createServer } from "http"; // necesario para compartir puerto con Socket.IO
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { errorsMiddleware } from "./middlewares/errorsMiddleware";
import { router as authRouter } from "./features/auth/auth.router";
import { router as actividadesRouter } from "./features/actividades/actividades.router";
import { router as asistenciasRouter } from "./features/asistencias/asistencias.router";
import { router as interaccionesRouter } from "./features/interacciones/interacciones.router";
import { router as chatRouter } from "./features/chat/chat.router";
import { initChatGateway } from "./features/chat/chat.gateway";

const app = express();

// ── Middlewares globales ───────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ── Rutas REST ────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("Nubbi API"));

app.use("/api/auth", authRouter);
app.use("/api/actividades", actividadesRouter);
app.use("/api/asistencias", asistenciasRouter);
app.use("/api/interacciones", interaccionesRouter);
app.use("/api/chat", chatRouter); // endpoints REST del chat (salas, historial)

// ── Middleware de errores (debe ir al final) ──────────────────────────────────
app.use(errorsMiddleware);

// ── Servidor HTTP + WebSocket ─────────────────────────────────────────────────
// Socket.IO necesita el servidor HTTP de Node, no la app de Express directamente.
// Al crear httpServer a partir de app, ambos comparten el mismo puerto.
const httpServer = createServer(app);

// Inicializar el gateway de chat (Socket.IO) sobre el mismo servidor HTTP
const io = initChatGateway(httpServer);

// Exportar io por si algún controlador necesita emitir eventos desde fuera del gateway
export { io };

const start = async () => {
  if (NODE_ENV !== "production") {
    httpServer.listen(PORT, () => {
      console.log(`[HTTP] Servidor en http://localhost:${PORT}`);
      console.log(`[WS]   WebSocket en ws://localhost:${PORT}`);
    });
  }
};

start();

export default app;