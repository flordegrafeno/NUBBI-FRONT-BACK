import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { useAxios } from "./AxiosProvider";
import { useSocket } from "./SocketProvider";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  description?: string;
  creator_name?: string; // viene del JOIN en el endpoint REST
}

export interface MessagePayload {
  id: string;
  room_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; email: string };
}

// Alias para uso interno (mismo shape que MessagePayload)
export type ChatMessage = MessagePayload;

// ─── useRooms ─────────────────────────────────────────────────────────────────
// Obtiene la lista de salas via REST y la refresca cuando hay cambios.
// No usa WebSocket porque las salas cambian con poca frecuencia.
export const useRooms = () => {
  const axios = useAxios();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ChatRoom[]>("/api/chat/rooms");
      setRooms(data);
    } catch (err: any) {
      setError(err.message ?? "Error obteniendo salas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
};

// ─── useCreateRoom ────────────────────────────────────────────────────────────
// Crea una sala via REST. El servidor la persiste en la base de datos.
export const useCreateRoom = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (
    name: string,
    _profileId: string,        // ya no se necesita en el cliente, el servidor lo toma del JWT
    description?: string
  ): Promise<ChatRoom | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<ChatRoom>("/api/chat/rooms", {
        name,
        description,
      });
      return data;
    } catch (err: any) {
      setError(err.message ?? "Error creando sala");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createRoom, loading, error };
};

// ─── useMessages ──────────────────────────────────────────────────────────────
// Carga el historial via REST y luego escucha mensajes nuevos via WebSocket.
//
// Flujo:
// 1. Al montar: GET /api/chat/rooms/:roomId/messages → carga los últimos 50
// 2. Al montar: socket.emit("join_room") → suscribe al canal WebSocket
// 3. En tiempo real: escucha "new_message" y agrega al estado local
// 4. Al desmontar: socket.emit("leave_room") + limpia listener
export const useMessages = (roomId: string | null) => {
  const axios = useAxios();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carga inicial del historial via REST
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    axios
      .get<ChatMessage[]>(`/api/chat/rooms/${roomId}/messages?limit=50`)
      .then(({ data }) => setMessages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  // Suscripción WebSocket a mensajes en tiempo real
  useEffect(() => {
    if (!roomId || !socket) return;

    // Unirse a la sala en el servidor
    joinRoom(roomId);

    // Handler para mensajes nuevos
    const handleNewMessage = (msg: ChatMessage) => {
      // Solo procesar mensajes de esta sala (defensa ante race conditions)
      if (msg.room_id !== roomId) return;

      setMessages((prev) => {
        // Evitar duplicados: puede pasar si el mismo usuario recibe el mensaje
        // tanto por el echo del servidor como por la carga inicial
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("new_message", handleNewMessage);

    // Al salir de la sala o cambiar de roomId, limpiar todo
    return () => {
      socket.off("new_message", handleNewMessage);
      leaveRoom(roomId);
    };
  }, [roomId, socket]); // se re-ejecuta si cambia la sala o el socket

  return { messages, loading };
};

// ─── useSendMessage ───────────────────────────────────────────────────────────
// Envía un mensaje via WebSocket. El servidor lo persiste y hace el broadcast.
// No hacemos ningún insert REST desde el cliente: el servidor es la fuente de verdad.
export const useSendMessage = () => {
  const { sendMessage: socketSend, connected } = useSocket();
  const [sending, setSending] = useState(false);

  const sendMessage = async (
    roomId: string,
    _profileId: string,  // ya no se necesita, el servidor usa el JWT
    content: string
  ): Promise<boolean> => {
    if (!content.trim() || !connected) return false;

    setSending(true);
    // El envío WebSocket es síncrono desde la perspectiva del cliente
    socketSend(roomId, content);
    // Pequeño delay para que el estado de "enviando" sea visible
    await new Promise((r) => setTimeout(r, 100));
    setSending(false);
    return true;
  };

  return { sendMessage, sending };
};

// ─── useTypingIndicator ───────────────────────────────────────────────────────
// Gestiona el indicador de "está escribiendo…" via WebSocket Broadcast.
// El timer de 3 segundos elimina el indicador si no llegan más eventos.
export const useTypingIndicator = (
  roomId: string | null,
  myProfileId: string | null
) => {
  const { socket, emitTyping } = useSocket();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  // Map para guardar los timers de cada usuario (para limpiarlos si llega otro evento)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Escuchar eventos de typing de otros usuarios
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTyping = ({
      profileId,
      name,
      isTyping,
    }: {
      profileId: string;
      name: string;
      isTyping: boolean;
    }) => {
      // Ignorar el propio indicador
      if (profileId === myProfileId) return;

      if (isTyping) {
        // Agregar usuario a la lista si no está
        setTypingUsers((prev) =>
          prev.includes(name) ? prev : [...prev, name]
        );

        // Reiniciar el timer: si en 3 segundos no llega otro evento, quitar
        const existing = timersRef.current.get(name);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((n) => n !== name));
          timersRef.current.delete(name);
        }, 3000);

        timersRef.current.set(name, timer);
      } else {
        // El usuario paró de escribir explícitamente
        setTypingUsers((prev) => prev.filter((n) => n !== name));
        const existing = timersRef.current.get(name);
        if (existing) {
          clearTimeout(existing);
          timersRef.current.delete(name);
        }
      }
    };

    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("user_typing", handleTyping);
      // Limpiar todos los timers pendientes al desmontar
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [socket, roomId, myProfileId]);

  // Función que el componente llama mientras el usuario escribe
  // Usa un ref para el debounce y evita emitir demasiados eventos
  const lastEmitRef = useRef(0);
  const broadcastTyping = useCallback(
    (name: string) => {
      if (!roomId) return;
      const now = Date.now();
      // Throttle: emitir máximo una vez por segundo
      if (now - lastEmitRef.current < 1000) return;
      lastEmitRef.current = now;
      emitTyping(roomId, true);
    },
    [roomId, emitTyping]
  );

  return { typingUsers, broadcastTyping };
};