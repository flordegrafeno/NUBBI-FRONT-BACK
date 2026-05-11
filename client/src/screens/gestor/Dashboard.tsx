// DashboardScreen.tsx
// Pantalla principal de análisis. Muestra métricas clave y el embudo AIDA
// calculado a partir de las interacciones registradas en las actividades.

import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, gestorNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para el gestor, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en gestorNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de gestor de la aplicación
import { useActividades } from "../../providers/ActividadesProvider";// Importación del hook useActividades para acceder al contexto de actividades, lo que permite a los componentes de esta pantalla obtener la lista de actividades creadas por el gestor y su estado de carga, para mostrar esta información en las métricas clave del dashboard y proporcionar una experiencia personalizada al usuario al mostrar datos relevantes sobre sus actividades en la aplicación
import { useInteraccionesAgregadas, type Interaccion } from "../../providers/InteraccionesProvider";// Importación del hook useInteraccionesAgregadas para acceder al contexto de interacciones agregadas, lo que permite a los componentes de esta pantalla obtener la lista de interacciones registradas en las actividades creadas por el gestor y su estado de carga, para mostrar esta información en las métricas clave del dashboard y calcular el embudo AIDA para proporcionar una experiencia personalizada al usuario al mostrar datos relevantes sobre el compromiso de las familias con sus actividades en la aplicación

/**
 * Calcula los porcentajes del modelo AIDA sobre el total de interacciones.
 * Cada etapa cuenta cuántas interacciones tienen ese flag en true.
 * Si no hay interacciones, todos los valores quedan en 0.
 */
const calcAida = (interacciones: Interaccion[]) => {// Función para calcular los porcentajes del modelo AIDA (Atención, Interés, Deseo, Acción) a partir de la lista de interacciones, lo que permite mostrar estas métricas clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
  const total = interacciones.length;// Variable para almacenar el total de interacciones, que se obtiene a partir de la longitud de la lista de interacciones, lo que permite calcular los porcentajes de cada etapa del modelo AIDA en función del total de interacciones registradas
  const pct = (n: number) => total === 0 ? 0 : Math.round((n / total) * 100);// Función para calcular el porcentaje de una etapa del modelo AIDA, que toma como argumento el número de interacciones que cumplen con esa etapa y devuelve el porcentaje correspondiente en función del total de interacciones, lo que permite mostrar estas métricas clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
  return [// El resultado es un array de objetos con la etiqueta, el valor porcentual y el color para cada etapa del modelo AIDA, lo que permite mostrar esta información de manera visual y clara en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
    { label: "Atención", valor: pct(interacciones.filter((i) => i.atencion).length), color: colors.blue },// El porcentaje de interacciones que cumplen con la etapa de Atención, calculado filtrando las interacciones que tienen el flag de atención en true y aplicando la función de porcentaje, lo que permite mostrar esta métrica clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
    { label: "Interés",  valor: pct(interacciones.filter((i) => i.interes).length),  color: colors.orange },// El porcentaje de interacciones que cumplen con la etapa de Interés, calculado filtrando las interacciones que tienen el flag de interés en true y aplicando la función de porcentaje, lo que permite mostrar esta métrica clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
    { label: "Deseo",    valor: pct(interacciones.filter((i) => i.deseo).length),    color: colors.pink },// El porcentaje de interacciones que cumplen con la etapa de Deseo, calculado filtrando las interacciones que tienen el flag de deseo en true y aplicando la función de porcentaje, lo que permite mostrar esta métrica clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
    { label: "Acción",   valor: pct(interacciones.filter((i) => i.accion).length),   color: colors.teal },// El porcentaje de interacciones que cumplen con la etapa de Acción, calculado filtrando las interacciones que tienen el flag de acción en true y aplicando la función de porcentaje, lo que permite mostrar esta métrica clave en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto
  ];
};

export const DashboardScreen = () => {// Componente principal de la pantalla de dashboard para el gestor, que muestra una barra superior con el título y una sección de contenido con métricas clave (número de actividades, número de interacciones, tasa de acción e interés) y un análisis visual del embudo AIDA, lo que permite a los gestores analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto dentro de la sección de gestor de la aplicación
  const { actividades, loading: loadingActs } = useActividades();// Utiliza el hook useActividades para obtener la lista de actividades creadas por el gestor y su estado de carga, lo que permite a los componentes de esta pantalla mostrar esta información en las métricas clave del dashboard y proporcionar una experiencia personalizada al usuario al mostrar datos relevantes sobre sus actividades en la aplicación
  const actividadIds = actividades.map((a) => a.id); // IDs para consultar interacciones agregadas
  const { interacciones, loading: loadingInts } = useInteraccionesAgregadas(actividadIds);// Utiliza el hook useInteraccionesAgregadas para obtener la lista de interacciones registradas en las actividades creadas por el gestor y su estado de carga, lo que permite a los componentes de esta pantalla mostrar esta información en las métricas clave del dashboard y calcular el embudo AIDA para proporcionar una experiencia personalizada al usuario al mostrar datos relevantes sobre el compromiso de las familias con sus actividades en la aplicación

  // Muestra el indicador de carga mientras cualquiera de los dos providers esté resolviendo
  const loading = loadingActs || loadingInts;// Variable para determinar si se debe mostrar el indicador de carga, que se establece en true si cualquiera de los dos providers (actividades o interacciones) está en estado de carga, lo que permite mostrar un mensaje de "Cargando..." en la interfaz de usuario mientras se obtienen los datos necesarios para mostrar las métricas clave y el análisis del embudo AIDA en el dashboard
  const aida = calcAida(interacciones);// Variable para almacenar el resultado del cálculo del embudo AIDA, que se obtiene llamando a la función calcAida con la lista de interacciones, lo que permite mostrar esta información de manera visual y clara en el dashboard para que el gestor pueda analizar el compromiso de las familias con sus actividades y tomar decisiones informadas para mejorar su impacto

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />

      {/* Área scrolleable principal con padding inferior para no quedar detrás del BottomNav */}
      <div style={{
        flex: 1, overflowY: "auto", background: colors.offWhite,
        padding: "12px 14px 64px", display: "flex", flexDirection: "column", gap: 12,
      }}>

        {/* Header degradado con título y badge de carga condicional */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeLight})`,
          borderRadius: 16, padding: "14px 16px", color: "white",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, fontFamily: fonts.body }}>Dashboard</div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
              Análisis de compromiso AIDA
            </div>
          </div>
          {loading && (
            <div style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", fontFamily: fonts.body }}>
              Cargando...
            </div>
          )}
        </div>

        {/* Grid 2×2 de tarjetas métricas: actividades, interacciones, tasa de acción, tasa de interés */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🎯", valor: String(actividades.length),      label: "Actividades",     color: colors.blue,   bg: colors.blueLight       },
            { icon: "💬", valor: String(interacciones.length),    label: "Interacciones",   color: colors.teal,   bg: colors.tealLight       },
            { icon: "📊", valor: `${aida[3]?.valor ?? 0}%`,      label: "Tasa de acción",  color: colors.orange, bg: colors.orangeVeryLight },
            { icon: "⭐", valor: `${aida[1]?.valor ?? 0}%`,      label: "Tasa de interés", color: colors.pink,   bg: "#FFF0F3"              },
          ].map((m, i) => (
            <div key={i} style={{ background: m.bg, borderRadius: 14, padding: "14px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: fonts.body }}>{m.valor}</div>
              <div style={{ fontSize: 10, color: colors.textLight, marginTop: 2, fontFamily: fonts.body }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Sección de barras de progreso del embudo AIDA */}
        <div style={{ background: "white", borderRadius: 16, padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, fontFamily: fonts.body, marginBottom: 14 }}>
            Modelo AIDA
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aida.map((etapa) => (
              <div key={etapa.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, fontFamily: fonts.body }}>
                    {etapa.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: etapa.color, fontFamily: fonts.body }}>
                    {etapa.valor}%
                  </span>
                </div>
                {/* Barra de fondo gris con relleno animado en el color de la etapa */}
                <div style={{ height: 8, background: colors.gray200, borderRadius: 4 }}>
                  <div style={{
                    width: `${etapa.valor}%`, height: "100%", borderRadius: 4,
                    background: `linear-gradient(90deg, ${etapa.color}80, ${etapa.color})`,
                    transition: "width 0.6s ease", // Animación suave al montar o actualizar datos
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Estado vacío: solo visible cuando la carga terminó y no hay interacciones */}
          {!loading && interacciones.length === 0 && (
            <div style={{ marginTop: 14, fontSize: 11, color: colors.textLight, fontFamily: fonts.body, textAlign: "center" }}>
              Aún no hay interacciones registradas.
            </div>
          )}
        </div>

      </div>
      <BottomNav items={gestorNav} />
    </div>
  );
};