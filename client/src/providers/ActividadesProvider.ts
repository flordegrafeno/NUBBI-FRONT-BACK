import { useState, useEffect, useCallback } from "preact/hooks";
import { useAxios } from "./AxiosProvider";
import { useSocket } from "./SocketProvider";

export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  ubicacion: string | null;
  qr_payload: string;
  imagen_url: string | null;
  creada_por: string;
  created_at: string;
}

export interface CreateActividadDTO {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  ubicacion?: string;
  imagen_url?: string;
}

// ─── useActividades ───────────────────────────────────────────────────────────
// Carga las actividades via REST y escucha nuevas actividades via WebSocket.
//
// Flujo en tiempo real:
// 1. Al montar: GET /api/actividades → carga la lista actual
// 2. En tiempo real: socket escucha "nueva_actividad"
//    → la agrega al inicio de la lista sin recargar todo
export const useActividades = (soloActivas = false) => {
  const axios = useAxios();
  const { socket } = useSocket();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial via REST
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Actividad[]>("/api/actividades");
      setActividades(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cargando actividades");
    } finally {
      setLoading(false);
    }
  }, [soloActivas]);

  // Carga al montar
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Escuchar nuevas actividades en tiempo real via WebSocket
  // El servidor emite "nueva_actividad" a la sala global "actividades"
  // cada vez que un gestor crea una nueva
  useEffect(() => {
    if (!socket) return;

    const handleNuevaActividad = (actividad: Actividad) => {
      // Si solo mostramos activas, verificar que la fecha ya pasó
      if (soloActivas) {
        const yaInicio = new Date(actividad.fecha_inicio) <= new Date();
        if (!yaInicio) return; // ignorar actividades futuras en el modo familia
      }

      setActividades((prev) => {
        // Evitar duplicados si la actividad ya está en la lista
        // (puede pasar si el gestor y la familia están en el mismo dispositivo)
        if (prev.find((a) => a.id === actividad.id)) return prev;

        // Insertar al inicio para que aparezca arriba como la más reciente
        return [actividad, ...prev];
      });
    };

    socket.on("nueva_actividad", handleNuevaActividad);

    // Limpiar el listener al desmontar
    return () => {
      socket.off("nueva_actividad", handleNuevaActividad);
    };
  }, [socket, soloActivas]);

  return { actividades, loading, error, refetch: fetch };
};

// ─── useCreateActividad ───────────────────────────────────────────────────────
// Crea una actividad via REST. El servidor se encarga de emitir
// el evento WebSocket a todos los clientes conectados.
// El gestor también verá la nueva actividad en su lista porque
// el evento "nueva_actividad" llega a TODOS incluyendo al emisor.
export const useCreateActividad = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (dto: CreateActividadDTO): Promise<Actividad> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<Actividad>("/api/actividades", dto);
      // No hace falta agregar manualmente al estado local porque
      // el WebSocket "nueva_actividad" lo hará automáticamente
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creando actividad";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { crear, loading, error };
};