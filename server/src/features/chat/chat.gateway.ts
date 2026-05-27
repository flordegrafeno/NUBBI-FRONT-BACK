import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { pool } from "../../config/database";
import { supabase } from "../../config/supabase";
import type { Actividad } from "../actividades/actividades.types";

export interface MessagePayload {
  id: string;
  room_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; email: string };
}

// Referencia global para poder emitir desde otros módulos (ej: actividades)
let _io: SocketIOServer | null = null;

// Llamado desde el servicio de actividades al crear una nueva
export const emitNuevaActividad = (actividad: Actividad) => {
  if (_io) {
    _io.to("actividades").emit("nueva_actividad", actividad);
    console.log(`[WS] Nueva actividad emitida: ${actividad.titulo}`);
  }
};

export const initChatGateway = (httpServer: HTTPServer) => {
  // Sin genéricos explícitos para evitar el bug del parser de ts-node
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

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

    // Guardar usuario en el socket para accederlo en los handlers
    (socket as any).data = { user: result.rows[0] };
    next();
  });

  // ── Handlers de conexión ──────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const user = (socket as any).data?.user as {
      id: string;
      email: string;
      full_name: string;
      role: "familia" | "gestor";
    };

    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`[WS] Conectado: ${user.full_name} (${user.role})`);

    // Todos los usuarios se suscriben automáticamente al canal global
    // "actividades" para recibir nuevas actividades en tiempo real
    socket.join("actividades");

    // ── join_room ─────────────────────────────────────────────────────────
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`[WS] ${user.full_name} entró a sala ${roomId}`);
    });

    // ── leave_room ────────────────────────────────────────────────────────
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`[WS] ${user.full_name} salió de sala ${roomId}`);
    });

    // ── send_message ──────────────────────────────────────────────────────
    socket.on("send_message", async (payload: { roomId: string; content: string }) => {
      const { roomId, content } = payload;
      if (!content?.trim()) return;

      try {
        const result = await pool.query(
          `INSERT INTO messages (room_id, profile_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [roomId, user.id, content.trim()]
        );

        const savedMessage = result.rows[0];

        // Broadcast a todos en la sala incluyendo el emisor
        io.to(roomId).emit("new_message", {
          ...savedMessage,
          profiles: {
            full_name: user.full_name,
            email: user.email,
          },
        });
      } catch (err) {
        console.error("[WS] Error guardando mensaje:", err);
        socket.emit("error", "No se pudo enviar el mensaje");
      }
    });

    // ── typing ────────────────────────────────────────────────────────────
    socket.on("typing", (payload: { roomId: string; isTyping: boolean }) => {
      const { roomId, isTyping } = payload;
      // socket.to() envía a todos en la sala EXCEPTO al emisor
      socket.to(roomId).emit("user_typing", {
        profileId: user.id,
        name: user.full_name,
        isTyping,
      });
    });

    // ── disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", (reason: string) => {
      console.log(`[WS] ${user.full_name} desconectado: ${reason}`);
    });
  });

  return io;
};