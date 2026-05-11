import { useState } from "preact/hooks"; // Cambiado a Preact
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para usar en los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, para mostrar la barra de navegación inferior en la pantalla
import { useActividades, type Actividad } from "../../providers/ActividadesProvider";// Importación del hook useActividades y la interfaz Actividad desde el proveedor de actividades, para obtener la lista de actividades desde la API y para tipar las actividades que se muestran en la pantalla
import { useMiHistorialInteracciones, type InteraccionConActividad } from "../../providers/InteraccionesProvider";// Importación del hook useMiHistorialInteracciones y la interfaz InteraccionConActividad desde el proveedor de interacciones, para obtener el historial de interacciones del usuario con las actividades y para tipar las interacciones que se muestran en la pantalla

const formatFecha = (iso: string) => {// Función para formatear una fecha en formato ISO a un formato más legible, que recibe una cadena de texto con la fecha en formato ISO y devuelve una cadena de texto con la fecha formateada en el formato "día mes" (por ejemplo, "12 mar")
  const d = new Date(iso);// Crea un objeto Date a partir de la cadena de texto con la fecha en formato ISO, lo que permite manipular y formatear la fecha de manera más fácil utilizando los métodos del objeto Date
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });// Devuelve una cadena de texto con la fecha formateada en el formato "día mes" (por ejemplo, "12 mar"), utilizando el método toLocaleDateString del objeto Date para formatear la fecha según la configuración regional de Colombia (es-CO) y especificando que se muestre el día como un número y el mes como una abreviatura de tres letras
};

const formatHora = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};

const ActividadCard = ({
  act,
  interaccion,
  onExpand,
  onParticipar,
}: {
  act: Actividad;
  interaccion: InteraccionConActividad | undefined;
  onExpand: () => void;
  onParticipar: () => void;
}) => {
  const [abierta, setAbierta] = useState(false);

  const handleExpand = () => {
    const siguiente = !abierta;
    setAbierta(siguiente);
    if (siguiente) onExpand();
  };

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    }}>
      <button
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

      {abierta && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 1, background: colors.gray200, marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, minWidth: 90 }}>
              {[
                { icon: "📅", value: formatFecha(act.fecha_inicio) },
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

export const ActividadesScreen = () => {
  const { actividades, loading } = useActividades(true);
  const { historial, marcarInteres, marcarDeseo } = useMiHistorialInteracciones();

  return (
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
