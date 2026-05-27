import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { pool } from "../../config/database";
import { supabase } from "../../config/supabase";
import type { Actividad } from "../actividades/actividades.types";

// ─── Tipos de eventos ─────────────────────────────────────────────────────────

interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (payload: { roomId: string; content: string }) => void;
  typing: (payload: { roomId: string; isTyping: boolean }) => void;
}

interface ServerToClientEvents {
  new_message: (message: MessagePayload) => void;
  user_typing: (payload: {
    profileId: string;
    name: string;
    isTyping: boolean;
  }) => void;
  // Nuevo evento: cuando un gestor crea una actividad, se emite a todos
  nueva_actividad: (actividad: Actividad) => void;
  error: (message: string) => void;
}

interface SocketData {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "familia" | "gestor";
  };
}

export interface MessagePayload {
  id: string;
  room_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; email: string };
}

// Variable global para poder usar io fuera del gateway
// (la necesita el controlador de actividades)
let _io: SocketIOServer | null = null;

// Función que llama el controlador de actividades para emitir
// la nueva actividad a todos los clientes conectados
export const emitNuevaActividad = (actividad: Actividad) => {
  if (_io) {
    // "actividades" es una sala global a la que todos se suscriben al conectar
    _io.to("actividades").emit("nueva_actividad", actividad);
    console.log(`[WS] Nueva actividad emitida: ${actividad.titulo}`);
  }
};

// ─── Inicializador ────────────────────────────────────────────────────────────

export const initChatGateway = (httpServer: HTTPServer) => {
  const io = new SocketIOServer
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Guardar referencia global para emitNuevaActividad
  _io = io;

  // ── Middleware de autenticación ───────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Token requerido"));

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return next(new Error("Token inválido"));

    const result = await pool.query(
      "SELECT id, email, full_name, role FROM profiles WHERE id = $1 LIMIT 1",
      [data.user.id]
    );
    if (result.rowCount === 0) return next(new Error("Perfil no encontrado"));

    socket.data.user = result.rows[0];
    next();
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`[WS] Conectado: ${user.full_name} (${user.role})`);

    // Al conectar, TODOS los usuarios se unen automáticamente a la sala
    // global "actividades" para recibir nuevas actividades en tiempo real
    socket.join("actividades");
    console.log(`[WS] ${user.full_name} suscrito a sala "actividades"`);

    // ── Chat: unirse a sala ───────────────────────────────────────────────
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`[WS] ${user.full_name} entró a sala ${roomId}`);
    });

    // ── Chat: salir de sala ───────────────────────────────────────────────
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`[WS] ${user.full_name} salió de sala ${roomId}`);
    });

    // ── Chat: enviar mensaje ──────────────────────────────────────────────
    socket.on("send_message", async ({ roomId, content }) => {
      if (!content?.trim()) return;
      try {
        const result = await pool.query(
          `INSERT INTO messages (room_id, profile_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [roomId, user.id, content.trim()]
        );
        const savedMessage = result.rows[0];
        io.to(roomId).emit("new_message", {
          ...savedMessage,
          profiles: { full_name: user.full_name, email: user.email },
        });
      } catch (err) {
        console.error("[WS] Error guardando mensaje:", err);
        socket.emit("error", "No se pudo enviar el mensaje");
      }
    });

    // ── Chat: indicador de escritura ──────────────────────────────────────
    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("user_typing", {
        profileId: user.id,
        name: user.full_name,
        isTyping,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[WS] ${user.full_name} desconectado: ${reason}`);
    });
  });

  return io;
};