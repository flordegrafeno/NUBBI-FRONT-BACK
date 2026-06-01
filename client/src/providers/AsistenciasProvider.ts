import { useState, useEffect } from "preact/hooks"; // Cambiado a Preact
import { useAxios } from "./AxiosProvider";// Asegúrate de que este hook esté adaptado para Preact

export interface ScanResult {// Interfaz para el resultado de escanear un código QR, que incluye información sobre la asistencia registrada
  asistencia: { id: string; profile_id: string; actividad_id: string; qr_payload_usado: string; escaneado_at: string }; //    Objeto que representa la asistencia registrada, con su ID, el ID del perfil del usuario, el ID de la actividad, el payload del QR usado y la fecha de escaneo
}// Puedes ajustar los campos de esta interfaz según lo que realmente devuelva tu API al escanear un código QR

export const useBalance = () => {// Hook para obtener el balance de puntos del usuario, que hace una petición a la API para obtener el total de puntos acumulados por el usuario a través de sus asistencias registradas
  const axios = useAxios();// Hook personalizado para hacer peticiones HTTP con Axios
  const [puntos, setPuntos] = useState<number | null>(null);// Estado para almacenar el total de puntos del usuario, que se obtiene de la respuesta de la API 
  const [loading, setLoading] = useState(true);// Estado para indicar si la carga del balance de puntos está en progreso

  useEffect(() => {// useEffect para cargar el balance de puntos cuando el componente se monta
    axios.get<{ total: number }>("/api/asistencias/balance")// Realiza una petición GET a la API para obtener el balance de puntos del usuario, esperando un objeto con un campo total que representa el total de puntos acumulados 
      .then(({ data }) => setPuntos(data.total))// Actualiza el estado de puntos con el total obtenido de la respuesta de la API
      .catch(console.error)// Si ocurre un error durante la petición, se muestra el error en la consola (puedes manejarlo de otra forma si lo prefieres)
      .finally(() => setLoading(false));// Finalmente, independientemente de si la petición fue exitosa o no, se indica que la carga ha finalizado
  }, []);// El array de dependencias vacío [] asegura que este efecto solo se ejecute una vez cuando el componente se monta

  return { puntos, loading };// El hook devuelve un objeto con el total de puntos del usuario y el estado de carga para que el componente que use este hook pueda mostrar un indicador de carga mientras se obtiene el balance de puntos
};

export const useScanQR = () => {// Hook para escanear un código QR y registrar la asistencia a través de la API, que hace una petición POST a la API con el payload del QR escaneado para registrar la asistencia del usuario a la actividad correspondiente
  const axios = useAxios();// Hook personalizado para hacer peticiones HTTP con Axios
  const [loading, setLoading] = useState(false);// Estado para indicar si el proceso de escanear el código QR y registrar la asistencia está en progreso  
  const [error, setError] = useState<string | null>(null);// Estado para almacenar cualquier error que ocurra durante el proceso de escanear el código QR y registrar la asistencia
  const [resultado, setResultado] = useState<ScanResult | null>(null);// Estado para almacenar el resultado del escaneo del código QR, que incluye la información de la asistencia registrada

  const scan = async (qr_payload: string) => {// Función para escanear un código QR, que recibe el payload del QR escaneado como argumento y devuelve una promesa que resuelve con el resultado del escaneo (información de la asistencia registrada) o rechaza con un error si ocurre algún problema durante el proceso  
    setLoading(true);// Indica que el proceso de escanear el código QR y registrar la asistencia está en progreso
    setError(null);// Reinicia el estado de error antes de intentar escanear el código QR y registrar la asistencia
    setResultado(null);// Reinicia el estado de resultado antes de intentar escanear el código QR y registrar la asistencia
    try {// Intenta realizar la petición a la API para escanear el código QR y registrar la asistencia
      const { data } = await axios.post<ScanResult>("/api/asistencias/scan", { qr_payload });// Realiza una petición POST a la API para escanear el código QR y registrar la asistencia, enviando el payload del QR escaneado en el cuerpo de la petición, y esperando un objeto ScanResult como respuesta que contiene la información de la asistencia registrada  
      setResultado(data);// Actualiza el estado de resultado con la información de la asistencia registrada obtenida de la respuesta de la API
      return data;// Devuelve el resultado del escaneo (información de la asistencia registrada) para que el componente que use este hook pueda manejarlo según sea necesario
    } catch (e: unknown) {// Si ocurre un error durante la petición, actualiza el estado de error con el mensaje correspondiente y lanza un nuevo error para que el componente que use este hook pueda manejarlo según sea necesario
      const msg = e instanceof Error ? e.message : "Error al escanear";// El mensaje de error se obtiene del objeto de error si es una instancia de Error, o se establece un mensaje genérico si no lo es 
      setError(msg);// Actualiza el estado de error con el mensaje correspondiente
      throw new Error(msg);// Lanza un nuevo error con el mensaje correspondiente para que el componente que use este hook pueda manejarlo según sea necesario (por ejemplo, mostrando una notificación al usuario)
    } finally {// Finalmente, independientemente de si la petición fue exitosa o no, se indica que el proceso de escanear el código QR y registrar la asistencia ha finalizado
      setLoading(false);// Indica que el proceso de escanear el código QR y registrar la asistencia ha finalizado
    }// El bloque try-catch-finally asegura que el estado de carga se actualice correctamente y que cualquier error se maneje adecuadamente, proporcionando una experiencia de usuario fluida incluso en caso de problemas durante el proceso de escanear el código QR y registrar la asistencia
  };

  const reset = () => {
    setResultado(null);
    setError(null);
  };

  return { scan, loading, error, resultado, reset };// El hook devuelve un objeto con la función scan para escanear un código QR y registrar la asistencia, el estado de carga, el estado de error y el resultado del escaneo para que el componente que use este hook pueda manejar estos estados y mostrar la información de la asistencia registrada según sea necesario
  
};
