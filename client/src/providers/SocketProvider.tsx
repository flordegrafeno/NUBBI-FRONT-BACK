import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import type { MessagePayload } from "./ChatProvider";

// ─── Tipos de eventos (espejo del servidor) ───────────────────────────────────

// Eventos que el cliente ENVÍA
interface ClientEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (payload: { roomId: string; content: string }) => void;
  typing: (payload: { roomId: string; isTyping: boolean }) => void;
}

// Eventos que el cliente RECIBE
interface ServerEvents {
  new_message: (message: MessagePayload) => void;
  user_typing: (payload: {
    profileId: string;
    name: string;
    isTyping: boolean;
  }) => void;
  error: (message: string) => void;
}

type AppSocket = Socket<ServerEvents, ClientEvents>;

// ─── Contexto ─────────────────────────────────────────────────────────────────

interface SocketContextValue {
  socket: AppSocket | null;         // instancia del socket (null si no conectado)
  connected: boolean;               // estado de la conexión
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  emitTyping: (roomId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  emitTyping: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SocketProvider = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const { auth } = useAuth();
  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Solo conectar si el usuario está autenticado
    if (!auth?.session?.access_token) {
      // Si había una conexión previa, cerrarla
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // URL del servidor WebSocket (misma que la API REST)
    const WS_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // Crear la conexión Socket.IO
    const socket: AppSocket = io(WS_URL, {
      // El token JWT se envía en el handshake para que el middleware del
      // servidor pueda autenticar la conexión antes de aceptarla
      auth: { token: auth.session.access_token },

      // Intentar reconectar automáticamente si se cae la conexión
      reconnection: true,
      reconnectionAttempts: 5,       // máximo 5 reintentos
      reconnectionDelay: 1000,       // 1 segundo entre reintentos
      reconnectionDelayMax: 5000,    // máximo 5 segundos de espera

      // Transporte: primero WebSocket nativo, fallback a long-polling
      transports: ["websocket", "polling"],
    });

    // ── Eventos del ciclo de vida de la conexión ──────────────────────────
    socket.on("connect", () => {
      console.log("[WS] Conectado:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[WS] Desconectado:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[WS] Error de conexión:", err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    // Limpiar la conexión al desmontar o cuando cambie el token
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [auth?.session?.access_token]); // reconectar si cambia el token (ej. refresh)

  // ── Helpers tipados ───────────────────────────────────────────────────────
  // Estos wrappers comprueban que el socket está conectado antes de emitir,
  // evitando errores silenciosos cuando el cliente está offline.

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit("join_room", roomId);
  };

  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit("leave_room", roomId);
  };

  const sendMessage = (roomId: string, content: string) => {
    if (!content.trim()) return;
    socketRef.current?.emit("send_message", { roomId, content });
  };

  const emitTyping = (roomId: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { roomId, isTyping });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        joinRoom,
        leaveRoom,
        sendMessage,
        emitTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);