import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { useAxios } from "./AxiosProvider";
import { useSocket } from "./SocketProvider";
import { supabase } from "../config/supabase";

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
  created_by: { id: string; userName: string; email: string };
  content: string;
  created_at: string;
}

// Alias para uso interno (mismo shape que MessagePayload)
export type ChatMessage = MessagePayload;

// ─── useRooms ─────────────────────────────────────────────────────────────────
// Obtiene la lista de salas via REST y escucha creaciones/eliminaciones en tiempo real.
export const useRooms = () => {
  const axios = useAxios();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ChatRoom[]>("/api/rooms");
      setRooms(data);
    } catch (err: any) {
      setError(err.message ?? "Error obteniendo salas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Tiempo real: sala creada o eliminada
  useEffect(() => {
    const channel = supabase
      .channel('rooms')
      .on('broadcast', { event: 'room-created' }, ({ payload }) => {
        const room = payload as ChatRoom;
        setRooms((prev) => {
          if (prev.find((r) => r.id === room.id)) return prev;
          return [room, ...prev];
        });
      })
      .on('broadcast', { event: 'room-deleted' }, ({ payload }) => {
        const { roomId } = payload as { roomId: string };
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
      const { data } = await axios.post<ChatRoom>("/api/rooms", {
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
// Carga el historial via REST y escucha mensajes nuevos via Supabase Realtime.
export const useMessages = (roomId: string | null) => {
  const axios = useAxios();
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
      .get<ChatMessage[]>(`/api/rooms/${roomId}/messages`)
      .then(({ data }) => setMessages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  // Suscripción a mensajes en tiempo real via Supabase Realtime broadcast
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { messages, loading };
};

// ─── useSendMessage ───────────────────────────────────────────────────────────
// Envía un mensaje via REST POST. El servidor lo persiste y hace el broadcast.
export const useSendMessage = () => {
  const axios = useAxios();
  const [sending, setSending] = useState(false);

  const sendMessage = async (
    roomId: string,
    _profileId: string,
    content: string
  ): Promise<boolean> => {
    if (!content.trim()) return false;

    setSending(true);
    try {
      await axios.post(`/api/rooms/${roomId}/messages`, { content });
      return true;
    } catch (err) {
      console.error('[Chat] Error enviando mensaje:', err);
      return false;
    } finally {
      setSending(false);
    }
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
      console.log(name);
    },
    [roomId, emitTyping]
    
  );

  return { typingUsers, broadcastTyping };
};