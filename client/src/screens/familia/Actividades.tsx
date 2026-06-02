import { useState, useEffect } from "preact/hooks";
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para usar en los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, para mostrar la barra de navegación inferior en la pantalla
import { useActividades, type Actividad } from "../../providers/ActividadesProvider";// Importación del hook useActividades y la interfaz Actividad desde el proveedor de actividades, para obtener la lista de actividades desde la API y para tipar las actividades que se muestran en la pantalla
import { useMiHistorialInteracciones, type InteraccionConActividad } from "../../providers/InteraccionesProvider";// Importación del hook useMiHistorialInteracciones y la interfaz InteraccionConActividad desde el proveedor de interacciones, para obtener el historial de interacciones del usuario con las actividades y para tipar las interacciones que se muestran en la pantalla

const formatFecha = (iso: string) => {// Función para formatear una fecha en formato ISO a un formato más legible, que recibe una cadena de texto con la fecha en formato ISO y devuelve una cadena de texto con la fecha formateada en el formato "día mes" (por ejemplo, "12 mar")
  const d = new Date(iso);// Crea un objeto Date a partir de la cadena de texto con la fecha en formato ISO, lo que permite manipular y formatear la fecha de manera más fácil utilizando los métodos del objeto Date
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });// Devuelve una cadena de texto con la fecha formateada en el formato "día mes" (por ejemplo, "12 mar"), utilizando el método toLocaleDateString del objeto Date para formatear la fecha según la configuración regional de Colombia (es-CO) y especificando que se muestre el día como un número y el mes como una abreviatura de tres letras
};// Puedes ajustar el formato de fecha según tus necesidades o preferencias, por ejemplo, si quieres mostrar el año también, podrías agregar year: "numeric" al objeto de opciones en toLocaleDateString

const formatHora = (iso: string) => {// Función para formatear una hora en formato ISO a un formato más legible, que recibe una cadena de texto con la fecha y hora en formato ISO y devuelve una cadena de texto con la hora formateada en el formato "hora:minutos" (por ejemplo, "14:30")
  const d = new Date(iso);// Crea un objeto Date a partir de la cadena de texto con la fecha y hora en formato ISO, lo que permite manipular y formatear la hora de manera más fácil utilizando los métodos del objeto Date
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });// Devuelve una cadena de texto con la hora formateada en el formato "hora:minutos" (por ejemplo, "14:30"), utilizando el método toLocaleTimeString del objeto Date para formatear la hora según la configuración regional de Colombia (es-CO) y especificando que se muestre la hora con dos dígitos y los minutos con dos dígitos
};

const ActividadCard = ({// Componente para mostrar la información de una actividad en una tarjeta, que recibe la actividad a mostrar, la interacción del usuario con esa actividad (si existe), y las funciones para manejar la expansión de la tarjeta y para manejar la participación del usuario en la actividad
  act,// La actividad a mostrar en la tarjeta, que es un objeto con la información de la actividad obtenida de la API, incluyendo el título, la descripción, la fecha de inicio, la ubicación, etc.
  interaccion,// La interacción del usuario con esa actividad, que es un objeto con la información de cómo ha interactuado el usuario con esa actividad (si existe), incluyendo si ha mostrado interés o si desea participar, lo que permite mostrar esta información en la tarjeta para que el usuario pueda ver su estado de interacción con la actividad
  onExpand,// La función para manejar la expansión de la tarjeta, que se llama cuando el usuario hace clic en la tarjeta para expandirla y mostrar más información sobre la actividad, lo que permite mostrar u ocultar la información adicional de la actividad según el estado de expansión de la tarjeta
  onParticipar,// La función para manejar la participación del usuario en la actividad, que se llama cuando el usuario hace clic en el botón de participar en la tarjeta, lo que permite marcar la actividad como deseada o no deseada para el usuario y actualizar la interfaz de usuario en consecuencia para mostrar el estado de participación del usuario en la actividad
}: {
  act: Actividad;// La actividad a mostrar en la tarjeta, que es un objeto con la información de la actividad obtenida de la API, incluyendo el título, la descripción, la fecha de inicio, la ubicación, etc.
  interaccion: InteraccionConActividad | undefined;// La interacción del usuario con esa actividad, que es un objeto con la información de cómo ha interactuado el usuario con esa actividad (si existe), incluyendo si ha mostrado interés o si desea participar, lo que permite mostrar esta información en la tarjeta para que el usuario pueda ver su estado de interacción con la actividad
  onExpand: () => void;// La función para manejar la expansión de la tarjeta, que se llama cuando el usuario hace clic en la tarjeta para expandirla y mostrar más información sobre la actividad, lo que permite mostrar u ocultar la información adicional de la actividad según el estado de expansión de la tarjeta
  onParticipar: () => void;// La función para manejar la participación del usuario en la actividad, que se llama cuando el usuario hace clic en el botón de participar en la tarjeta, lo que permite marcar la actividad como deseada o no deseada para el usuario y actualizar la interfaz de usuario en consecuencia para mostrar el estado de participación del usuario en la actividad
}) => {
  const [abierta, setAbierta] = useState(false);// Estado local para controlar si la tarjeta está expandida o no, lo que permite mostrar u ocultar la información adicional de la actividad según el estado de expansión de la tarjeta

  const handleExpand = () => {// Función para manejar el clic en la tarjeta para expandirla o contraerla, que invierte el estado de expansión de la tarjeta y llama a la función onExpand si la tarjeta se está expandiendo, lo que permite mostrar u ocultar la información adicional de la actividad según el estado de expansión de la tarjeta y realizar cualquier acción adicional que se necesite cuando la tarjeta se expande (por ejemplo, cargar información adicional de la actividad desde la API)
    const siguiente = !abierta;// Calcula el siguiente estado de expansión de la tarjeta invirtiendo el estado actual, lo que permite cambiar entre expandida y contraída cada vez que se hace clic en la tarjeta
    setAbierta(siguiente);// Actualiza el estado de expansión de la tarjeta con el siguiente estado calculado, lo que permite mostrar u ocultar la información adicional de la actividad según el estado de expansión de la tarjeta
    if (siguiente) onExpand();// Si el siguiente estado es expandida (true), llama a la función onExpand para realizar cualquier acción adicional que se necesite cuando la tarjeta se expande (por ejemplo, cargar información adicional de la actividad desde la API)
  };

  return (// El componente devuelve un elemento JSX que representa la tarjeta de la actividad, con estilos para mostrar la información de la actividad de manera clara y atractiva, y con interactividad para expandir la tarjeta y para participar en la actividad, lo que permite a los usuarios ver las actividades disponibles, obtener más información sobre ellas y marcar su interés o participación en ellas de manera fácil e intuitiva a través de la interfaz de usuario de la tarjeta
    <div style={{// Estilos para la tarjeta de la actividad, que incluyen un fondo blanco, bordes redondeados, sombra para dar profundidad, y estilos para el contenido de la tarjeta para mostrar la información de la actividad de manera clara y atractiva
      background: "white",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    }}>
      <button // El botón para expandir la tarjeta, que ocupa todo el ancho de la tarjeta y tiene estilos para mostrar el título de la actividad y un ícono de flecha que indica si la tarjeta está expandida o no, lo que permite a los usuarios hacer clic en cualquier parte del encabezado de la tarjeta para expandirla o contraerla y ver más información sobre la actividad
        onClick={handleExpand}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: colors.pinkLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}>
          🎯
        </div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
          {act.titulo}
        </span>
        <span style={{
          fontSize: 18,
          color: colors.gray500,
          transform: abierta ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          lineHeight: 1,
        }}>
          ›
        </span>
      </button>

      {abierta && ( // Si la tarjeta está expandida, se muestra la información adicional de la actividad, incluyendo la fecha, hora, ubicación, descripción y el botón para participar en la actividad, lo que permite a los usuarios obtener más información sobre la actividad y marcar su interés o participación en ella de manera fácil e intuitiva a través de la interfaz de usuario de la tarjeta
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 1, background: colors.gray200, marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, minWidth: 90 }}>
              {[
                { icon: "📅", value: formatFecha(act.fecha_inicio) }, // Muestra la fecha de inicio de la actividad con un ícono de calendario, utilizando la función formatFecha para formatear la fecha en un formato más legible, lo que permite a los usuarios ver fácilmente cuándo se llevará a cabo la actividad
                { icon: "🕐", value: formatHora(act.fecha_inicio) },
                { icon: "📍", value: act.ubicacion ?? "Por definir" },
              ].map(({ icon, value }) => (
                <div key={icon} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ fontSize: 13, lineHeight: 1.4 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: colors.textLight, fontFamily: fonts.body, lineHeight: 1.4 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p style={{
              flex: 1,
              fontSize: 12,
              color: colors.textLight,
              fontFamily: fonts.body,
              lineHeight: 1.6,
              margin: 0,
            }}>
              {act.descripcion ?? "Sin descripción disponible."}
            </p>
          </div>

          <button
            onClick={onParticipar}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "11px 0",
              background: interaccion?.deseo ? colors.green : colors.pinkDark,
              border: "none",
              borderRadius: 12,
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: fonts.body,
              boxShadow: `0 4px 14px ${colors.pinkDark}40`,
              transition: "background 0.2s",
            }}
          >
            {interaccion?.deseo ? "✓ Participando" : "Participar"}
          </button>
        </div>
      )}
    </div>
  );
};

export const ActividadesScreen = () => {// Componente principal para mostrar la pantalla de actividades, que utiliza el hook useActividades para obtener la lista de actividades desde la API, y el hook useMiHistorialInteracciones para obtener el historial de interacciones del usuario con las actividades, y muestra una lista de tarjetas de actividades utilizando el componente ActividadCard, junto con la barra superior y la barra de navegación inferior para proporcionar una experiencia de usuario completa y coherente en la pantalla de actividades
  const { actividades, loading } = useActividades();
  const { historial, loading: loadingHistorial, marcarInteres, marcarDeseo, marcarAtencion } = useMiHistorialInteracciones();

  useEffect(() => {
    if (loading || loadingHistorial || actividades.length === 0) return;
    actividades.forEach((act) => {
      marcarAtencion(act.id).catch(console.error);
    });
  }, [loading, loadingHistorial, actividades]);

  return (// El componente principal devuelve un elemento JSX que representa la pantalla de actividades, con una estructura de diseño que incluye una barra superior, una sección principal para mostrar la lista de actividades y una barra de navegación inferior, lo que proporciona una experiencia de usuario completa y coherente en la pantalla de actividades para que los usuarios puedan ver las actividades disponibles para su familia, obtener más información sobre ellas y marcar su interés o participación en ellas de manera fácil e intuitiva a través de la interfaz de usuario de la pantalla de actividades
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh", width:"100%" }}>
      <TopBar />
      <div style={{ flex: 1, background: colors.offWhite, overflowY: "auto", paddingBottom: 64 }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.pink})`, padding: "16px 20px 20px" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
            Actividades
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: fonts.body }}>
            Elige una actividad y participa con tu familia
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: colors.textLight, fontFamily: fonts.body, fontSize: 13 }}>
              Cargando actividades...
            </div>
          )}
          {!loading && actividades.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: colors.textLight, fontFamily: fonts.body, fontSize: 13 }}>
              No hay actividades disponibles por ahora.
            </div>
          )}
          {actividades.map((act) => (
            <ActividadCard
              key={act.id}
              act={act}
              interaccion={historial.get(act.id)}
              onExpand={() => marcarInteres(act.id).catch(console.error)}
              onParticipar={() => marcarDeseo(act.id).catch(console.error)}
            />
          ))}
        </div>
      </div>
      <BottomNav items={familiaNav} />
    </div>
  );
};
