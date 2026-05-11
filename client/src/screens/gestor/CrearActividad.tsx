import { useState, useEffect } from "preact/hooks";// Cambiado a Preact
import { colors, fonts } from "../../tokens"; // Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, gestorNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para el gestor, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en gestorNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de gestor de la aplicación
import { useActividades, useCreateActividad } from "../../providers/ActividadesProvider";// Importación de hooks personalizados useActividades y useCreateActividad para gestionar el estado y las operaciones relacionadas con las actividades, lo que permite a los componentes de esta pantalla obtener la lista de actividades, crear nuevas actividades y manejar el estado de carga y errores relacionados con estas operaciones, mejorando la experiencia del usuario al proporcionar funcionalidades completas para la gestión de actividades dentro de la sección de gestor de la aplicación

const formatFecha = (iso: string) => {// Función para formatear una fecha en formato ISO a un formato legible en español, lo que permite mostrar las fechas de las actividades de manera clara y comprensible para los usuarios de habla hispana dentro de la sección de gestor de la aplicación
  const d = new Date(iso);// Crea un objeto Date a partir de la cadena de fecha en formato ISO, lo que permite manipular y formatear la fecha de manera más fácil utilizando los métodos disponibles en el objeto Date
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });// Devuelve la fecha formateada en formato legible en español (por ejemplo, "15 de mar. de 2024"), lo que permite mostrar las fechas de las actividades de manera clara y comprensible para los usuarios de habla hispana dentro de la sección de gestor de la aplicación
};

const inputStyle = {// Estilos comunes para los campos de entrada (input y textarea) en el formulario de creación de actividades, lo que permite mantener una apariencia visual consistente en los campos de entrada dentro de la sección de gestor de la aplicación al aplicar estos estilos a ambos tipos de campos
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 12,
  border: `1px solid ${colors.gray300}`,
  background: "white",
  outline: "none",
  color: colors.text,
  fontFamily: fonts.body,
  width: "100%",
  boxSizing: "border-box" as const,
};

export const CrearActividadScreen = () => {// Componente principal de la pantalla de creación de actividades para el gestor, que muestra una barra superior con el título y una sección de contenido con un header que incluye un gradiente y tabs para cambiar entre la vista de creación de actividades y el historial de actividades, y un formulario para crear nuevas actividades o una lista de actividades existentes según la pestaña seleccionada, lo que permite a los gestores gestionar sus actividades dentro de la sección de gestor de la aplicación
  const [tab, setTab] = useState<"crear" | "historial">("crear");// Estado para controlar la pestaña seleccionada, que puede ser "crear" o "historial", y se inicializa en "crear" para mostrar el formulario de creación de actividades por defecto, lo que permite a los usuarios cambiar entre la vista de creación de actividades y el historial de actividades según su preferencia al hacer clic en las pestañas correspondientes

  const [titulo, setTitulo] = useState("");// Estado para almacenar el título de la actividad que se está creando, lo que permite a los usuarios ingresar el título de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y mantener ese valor en el estado para su posterior uso al enviar el formulario
  const [desc, setDesc] = useState("");// Estado para almacenar la descripción de la actividad que se está creando, lo que permite a los usuarios ingresar la descripción de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y mantener ese valor en el estado para su posterior uso al enviar el formulario
  const [fecha, setFecha] = useState("");// Estado para almacenar la fecha de inicio de la actividad que se está creando, lo que permite a los usuarios ingresar la fecha de inicio de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y mantener ese valor en el estado para su posterior uso al enviar el formulario
  const [lugar, setLugar] = useState("");// Estado para almacenar el lugar de la actividad que se está creando, lo que permite a los usuarios ingresar el lugar de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y mantener ese valor en el estado para su posterior uso al enviar el formulario
  const [exito, setExito] = useState(false);// Estado para controlar si la creación de la actividad fue exitosa, lo que permite mostrar un mensaje de éxito al usuario después de crear una actividad correctamente en el formulario de creación de actividades dentro de la sección de gestor de la aplicación, y se establece en true cuando la creación es exitosa y se restablece a false al iniciar el proceso de creación para ocultar el mensaje de éxito mientras se realiza una nueva creación

  const { crear, loading, error } = useCreateActividad();// Utiliza el hook useCreateActividad para obtener la función de creación de actividades, el estado de carga y el estado de error relacionados con la creación de actividades, lo que permite a los componentes de esta pantalla crear nuevas actividades y manejar el estado de carga y errores relacionados con esta operación, mejorando la experiencia del usuario al proporcionar funcionalidades completas para la gestión de actividades dentro de la sección de gestor de la aplicación
  const { actividades, loading: loadingHist, refetch } = useActividades();// Utiliza el hook useActividades para obtener la lista de actividades, el estado de carga y la función de refetch relacionados con las actividades, lo que permite a los componentes de esta pantalla mostrar la lista de actividades existentes en el historial de actividades y manejar el estado de carga relacionado con la obtención de estas actividades, así como proporcionar una función para volver a cargar las actividades después de crear una nueva actividad o realizar otras operaciones que puedan afectar la lista de actividades, mejorando la experiencia del usuario al proporcionar funcionalidades completas para la gestión de actividades dentro de la sección de gestor de la aplicación

  useEffect(() => {// Efecto para volver a cargar la lista de actividades cuando se cambia a la pestaña de historial, lo que permite mostrar la información más actualizada en el historial de actividades después de crear una nueva actividad o realizar otras operaciones que puedan afectar la lista de actividades, mejorando la experiencia del usuario al proporcionar información actualizada en la sección de gestor de la aplicación
    if (tab === "historial") refetch();// Si la pestaña seleccionada es "historial", se llama a la función refetch para volver a cargar la lista de actividades, lo que permite mostrar la información más actualizada en el historial de actividades después de crear una nueva actividad o realizar otras operaciones que puedan afectar la lista de actividades, mejorando la experiencia del usuario al proporcionar información actualizada en la sección de gestor de la aplicación
  }, [tab]);// El efecto se ejecuta cada vez que cambia el valor de tab, lo que permite volver a cargar la lista de actividades cada vez que el usuario cambia a la pestaña de historial para mostrar la información más actualizada en esa sección

  const handleCrear = async (e: Event) => {// Función para manejar el envío del formulario de creación de actividades, lo que permite a los usuarios crear una nueva actividad ingresando la información requerida en el formulario y enviando esa información para su procesamiento, y maneja el estado de éxito y error relacionado con la creación de la actividad para proporcionar retroalimentación clara al usuario sobre el resultado de su acción
    e.preventDefault();// Previene el comportamiento predeterminado del formulario al enviarse, lo que evita que la página se recargue y permite manejar el proceso de creación de la actividad de manera controlada dentro de esta función
    setExito(false);// Establece el estado de éxito en false al iniciar el proceso de creación, lo que oculta cualquier mensaje de éxito anterior mientras se realiza una nueva creación de actividad, proporcionando una experiencia de usuario más clara y evitando confusiones al mostrar solo el mensaje de éxito relevante para la acción actual del usuario
    try {// Intenta crear una nueva actividad utilizando la función crear obtenida del hook useCreateActividad, pasando la información ingresada en el formulario (título, descripción, fecha de inicio y lugar) como argumentos, lo que permite a los usuarios crear una nueva actividad ingresando esta información en el formulario de creación de actividades dentro de la sección de gestor de la aplicación, y maneja el resultado de esta operación para proporcionar retroalimentación clara al usuario sobre el éxito o error de la creación de la actividad
      await crear({// Llama a la función crear obtenida del hook useCreateActividad para crear una nueva actividad con la información ingresada en el formulario, lo que permite a los usuarios crear una nueva actividad ingresando el título, descripción, fecha de inicio y lugar en el formulario de creación de actividades dentro de la sección de gestor de la aplicación, y maneja el resultado de esta operación para proporcionar retroalimentación clara al usuario sobre el éxito o error de la creación de la actividad
        titulo,// El título de la actividad que se está creando, lo que permite a los usuarios ingresar el título de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y utilizar ese valor al enviar el formulario para crear la actividad con ese título
        descripcion: desc || undefined,// La descripción de la actividad que se está creando, lo que permite a los usuarios ingresar la descripción de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y utilizar ese valor al enviar el formulario para crear la actividad con esa descripción, o dejarlo como undefined si no se proporciona una descripción
        fecha_inicio: new Date(fecha).toISOString(),// La fecha de inicio de la actividad que se está creando, lo que permite a los usuarios ingresar la fecha de inicio de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y utilizar ese valor al enviar el formulario para crear la actividad con esa fecha de inicio, convirtiendo la fecha ingresada a formato ISO para su procesamiento
        ubicacion: lugar || undefined,// El lugar de la actividad que se está creando, lo que permite a los usuarios ingresar el lugar de la actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación y utilizar ese valor al enviar el formulario para crear la actividad con ese lugar, o dejarlo como undefined si no se proporciona un lugar
      });
      setExito(true);// Si la creación de la actividad es exitosa, se establece el estado de éxito en true para mostrar un mensaje de éxito al usuario, lo que proporciona una retroalimentación clara sobre el resultado de su acción al crear una nueva actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación
      setTitulo("");// Restablece el estado del título a una cadena vacía después de crear la actividad, lo que limpia el campo de entrada del título en el formulario de creación de actividades para que los usuarios puedan ingresar un nuevo título para la próxima actividad que deseen crear, mejorando la experiencia del usuario al proporcionar un formulario limpio y listo para la siguiente entrada después de cada creación de actividad
      setDesc("");// Restablece el estado de la descripción a una cadena vacía después de crear la actividad, lo que limpia el campo de entrada de la descripción en el formulario de creación de actividades para que los usuarios puedan ingresar una nueva descripción para la próxima actividad que deseen crear, mejorando la experiencia del usuario al proporcionar un formulario limpio y listo para la siguiente entrada después de cada creación de actividad
      setFecha("");// Restablece el estado de la fecha a una cadena vacía después de crear la actividad, lo que limpia el campo de entrada de la fecha en el formulario de creación de actividades para que los usuarios puedan ingresar una nueva fecha para la próxima actividad que deseen crear, mejorando la experiencia del usuario al proporcionar un formulario limpio y listo para la siguiente entrada después de cada creación de actividad
      setLugar("");// Restablece el estado del lugar a una cadena vacía después de crear la actividad, lo que limpia el campo de entrada del lugar en el formulario de creación de actividades para que los usuarios puedan ingresar un nuevo lugar para la próxima actividad que deseen crear, mejorando la experiencia del usuario al proporcionar un formulario limpio y listo para la siguiente entrada después de cada creación de actividad
    } catch {// Si ocurre un error durante la creación de la actividad, no se realiza ninguna acción adicional aquí, ya que el estado de error ya está siendo manejado por el hook useCreateActividad y se muestra al usuario a través de la interfaz de usuario, lo que proporciona una retroalimentación clara sobre el resultado de su acción al crear una nueva actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación
      // error ya está en el estado del hook
    }// El bloque catch se deja vacío porque el estado de error ya está siendo manejado por el hook useCreateActividad, lo que permite mostrar el mensaje de error al usuario a través de la interfaz de usuario sin necesidad de realizar acciones adicionales en este bloque, proporcionando una experiencia de usuario clara y consistente al manejar los errores relacionados con la creación de actividades dentro de la sección de gestor de la aplicación
  };// La función handleCrear se ejecuta cuando el usuario envía el formulario de creación de actividades, lo que permite manejar el proceso de creación de la actividad de manera controlada y proporcionar retroalimentación clara al usuario sobre el éxito o error de su acción al crear una nueva actividad en el formulario de creación de actividades dentro de la sección de gestor de la aplicación

  return (// El componente devuelve una estructura de divs que conforman la pantalla de creación de actividades para el gestor, con estilos definidos para cada sección para lograr una apariencia visual clara y consistente, y con componentes como TopBar y BottomNav para proporcionar una experiencia de usuario fluida y fácil de navegar dentro de la sección de gestor de la aplicación, y con un formulario para crear nuevas actividades o una lista de actividades existentes según la pestaña seleccionada, lo que permite a los gestores gestionar sus actividades dentro de la sección de gestor de la aplicación
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ background: colors.pink, padding: "14px 20px", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
            Actividades
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: fonts.body }}>
            Las actividades se comparten directamente a los usuarios de Nubbi
          </div>

          <div style={{
            display: "flex", background: "rgba(255,255,255,0.2)", borderRadius: 20,
            padding: 3, marginTop: 10, gap: 2,
          }}>
            {(["crear", "historial"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: 16,
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? colors.pink : "white",
                  border: "none", cursor: "pointer", fontWeight: 700,
                  fontSize: 12, fontFamily: fonts.body, transition: "all 0.2s",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>// Botones para cambiar entre las pestañas de creación de actividades e historial de actividades, con estilos que indican claramente cuál pestaña está seleccionada, lo que permite a los usuarios navegar fácilmente entre estas dos vistas dentro de la sección de gestor de la aplicación y proporciona una experiencia de usuario clara y consistente al mostrar visualmente la pestaña activa
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 64, background: colors.offWhite }}>

          {tab === "crear" && (
            <form onSubmit={handleCrear} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                placeholder="*Título"
                value={titulo}
                onInput={(e) => setTitulo((e.target as HTMLInputElement).value)}
                required
                style={inputStyle}
              />
              <textarea
                placeholder="Descripción de la actividad"
                value={desc}
                onInput={(e) => setDesc((e.target as HTMLTextAreaElement).value)}
                style={{ ...inputStyle, resize: "none", height: 70 }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, border: `1px solid ${colors.gray300}`, padding: "8px 12px" }}>
                <span style={{ fontSize: 14 }}>📅</span>
                <input
                  type="datetime-local"
                  value={fecha}
                  onInput={(e) => setFecha((e.target as HTMLInputElement).value)}
                  required
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: fecha ? colors.text : colors.textLight, fontFamily: fonts.body, background: "transparent" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, border: `1px solid ${colors.gray300}`, padding: "8px 12px" }}>
                <span style={{ fontSize: 14 }}>📍</span>
                <input
                  placeholder="Lugar"
                  value={lugar}
                  onInput={(e) => setLugar((e.target as HTMLInputElement).value)}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 12, color: colors.text, fontFamily: fonts.body, background: "transparent" }}
                />
              </div>

              {exito && (
                <div style={{ padding: "10px 14px", background: colors.greenLight, borderRadius: 10, fontSize: 12, color: colors.green, fontFamily: fonts.body, textAlign: "center" }}>
                  ✓ Actividad creada exitosamente
                </div>
              )}
              {error && (
                <div style={{ padding: "10px 14px", background: "#FFF0F3", borderRadius: 10, fontSize: 12, color: colors.pinkDark, fontFamily: fonts.body, textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4, padding: 13,
                  background: loading ? colors.gray300 : colors.pinkDark,
                  border: "none", borderRadius: 12, color: "white", fontWeight: 700,
                  fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: fonts.body, boxShadow: loading ? "none" : `0 4px 14px ${colors.pink}50`,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Creando..." : "📤 Compartir"}
              </button>
            </form>
          )}

          {tab === "historial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingHist && (
                <div style={{ textAlign: "center", padding: 24, color: colors.textLight, fontFamily: fonts.body, fontSize: 12 }}>
                  Cargando...
                </div>
              )}
              {!loadingHist && actividades.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: colors.textLight, fontFamily: fonts.body, fontSize: 12 }}>
                  No hay actividades creadas aún.
                </div>
              )}
              {actividades.map((act) => (
                <div key={act.id} style={{
                  background: "white", borderRadius: 12, padding: "12px 14px",
                  display: "flex", gap: 10, alignItems: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: colors.pink + "20",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                  }}>
                    🎯
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.text, fontFamily: fonts.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.titulo}
                    </div>
                    <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                      {formatFecha(act.fecha_inicio)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <BottomNav items={gestorNav} />// Componente de navegación inferior que muestra las opciones de navegación definidas en gestorNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de gestor de la aplicación desde la parte inferior de la interfaz de usuario, proporcionando una experiencia de usuario fluida y fácil de navegar dentro de la sección de gestor de la aplicación
    </div>
  );
};
