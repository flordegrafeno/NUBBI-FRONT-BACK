import { useState, useEffect, useCallback } from "preact/hooks";
import { useAxios } from "./AxiosProvider";
import { useSocket } from "./SocketProvider";

export interface Actividad { // Definición de la interfaz Actividad
  id: string; // ID único de la actividad
  titulo: string; // Título de la actividad 
  descripcion: string | null; //  Descripción de la actividad, puede ser null
  fecha_inicio: string; // Fecha de inicio de la actividad en formato ISO
  ubicacion: string | null; //  Ubicación de la actividad, puede ser null
  qr_payload: string; //  Payload para el código QR asociado a la actividad 
  imagen_url: string | null; // URL de la imagen asociada a la actividad, puede ser null  
  creada_por: string; //  ID del usuario que creó la actividad
  created_at: string; // Fecha de creación de la actividad en formato ISO 
}// Puedes ajustar los tipos según lo que realmente devuelva tu API

export interface CreateActividadDTO { // DTO para crear una nueva actividad
  titulo: string;// Título de la actividad (requerido)
  descripcion?: string;// Descripción de la actividad (opcional)
  fecha_inicio: string;// Fecha de inicio de la actividad en formato ISO (requerido)
  ubicacion?: string;// Ubicación de la actividad (opcional)
  imagen_url?: string;// URL de la imagen asociada a la actividad (opcional)
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
  }, [soloActivas]);// La función fetch se memoriza con useCallback para evitar recrearla en cada renderizado, y solo se volverá a crear si cambia el valor de soloActivas

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

  return { actividades, loading, error, refetch: fetch };// El hook devuelve un objeto con la lista de actividades, el estado de carga, el estado de error y una función refetch para volver a cargar las actividades manualmente si es necesario 
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

  const crear = async (dto: CreateActividadDTO): Promise<Actividad> => {//  Función para crear una nueva actividad, recibe un objeto CreateActividadDTO con los datos necesarios para crear la actividad y devuelve una promesa que resuelve con el objeto Actividad creado
    setLoading(true);// Indica que la creación de la actividad está en progreso
    setError(null);// Reinicia el estado de error antes de intentar crear la actividad
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

  return { crear, loading, error };// El hook devuelve un objeto con la función crear para crear una nueva actividad, el estado de carga y el estado de error para que el componente que use este hook pueda manejar estos estados según sea necesario
};