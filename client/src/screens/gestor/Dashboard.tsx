// ─── PANTALLA DASHBOARD — FLUJO GESTOR ───────────────────────────────────────
// El gestor ve métricas de compromiso de las familias.
// Incluye estadísticas clave, el modelo AIDA y una gráfica de actividad semanal.

import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import type { ScreenProps } from "../../types";

// Datos del modelo AIDA — luego vienen del backend
const aida = [
  { label: "Atención", valor: 95, color: colors.blue   },
  { label: "Interés",  valor: 72, color: colors.orange },
  { label: "Deseo",    valor: 64, color: colors.pink   },
  { label: "Acción",   valor: 83, color: colors.teal   },
];

// Altura de cada barra de la gráfica semanal (en porcentaje)
const actividadSemanal = [
  { dia: "L", altura: 40  },
  { dia: "M", altura: 65  },
  { dia: "X", altura: 55  },
  { dia: "J", altura: 80  },
  { dia: "V", altura: 70  },
  { dia: "S", altura: 90, destacado: true }, // día con más actividad
  { dia: "D", altura: 60  },
];

export const DashboardScreen = ({ onNav }: ScreenProps) => (
  <PhoneFrame>
    <TopBar onBack={() => onNav("home-gestor")} />
    <div style={{
      flex: 1,
      overflowY: "auto",
      background: colors.offWhite,
      padding: "12px 14px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>

      {/* Header del dashboard */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeLight})`,
        borderRadius: 16,
        padding: "14px 16px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, fontFamily: fonts.body }}>Dashboard</div>
          <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
            Análisis de compromiso
          </div>
        </div>
        {/* Selector de mes */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 8,
          padding: "4px 10px",
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: fonts.body }}>June 2025</span>
          <span style={{ fontSize: 12 }}>›</span>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "👨‍👩‍👧‍👦", valor: "124", label: "Familias totales",    color: colors.blue,   bg: colors.blueLight        },
          { icon: "📊",        valor: "64%", label: "Tasa de asistencia", color: colors.green,  bg: colors.greenLight       },
          { icon: "⚡",        valor: "28",  label: "Activos hoy",        color: colors.orange, bg: colors.orangeVeryLight  },
          { icon: "💬",        valor: "124", label: "Interacciones",      color: colors.teal,   bg: colors.tealLight        },
        ].map((metrica, i) => (
          <div key={i} style={{
            background: metrica.bg,
            borderRadius: 14,
            padding: "14px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{metrica.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: metrica.color, fontFamily: fonts.body }}>
              {metrica.valor}
            </div>
            <div style={{ fontSize: 10, color: colors.textLight, marginTop: 2, fontFamily: fonts.body }}>
              {metrica.label}
            </div>
          </div>
        ))}
      </div>

      {/* Modelo AIDA */}
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
            Modelo AIDA
          </div>
          <button style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            color: colors.orange,
            fontWeight: 700,
            fontFamily: fonts.body,
          }}>
            Ver detalles
          </button>
        </div>

        {/* Barras de progreso de cada etapa */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aida.map((etapa) => (
            <div key={etapa.label}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, fontFamily: fonts.body }}>
                  {etapa.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: etapa.color, fontFamily: fonts.body }}>
                  {etapa.valor}%
                </span>
              </div>
              {/* Barra de fondo gris */}
              <div style={{ height: 8, background: colors.gray200, borderRadius: 4 }}>
                {/* Barra coloreada según el valor */}
                <div style={{
                  width: `${etapa.valor}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${etapa.color}80, ${etapa.color})`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica de actividad semanal */}
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, marginBottom: 12, fontFamily: fonts.body }}>
          Actividad semanal
        </div>

        {/* Barras de la gráfica */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {actividadSemanal.map((dia) => (
            <div key={dia.dia} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              height: "100%",
              justifyContent: "flex-end",
            }}>
              <div style={{
                width: "100%",
                height: `${dia.altura}%`,
                // El día destacado lleva gradiente naranja, los demás gris
                background: dia.destacado
                  ? `linear-gradient(180deg, ${colors.orange}, ${colors.yellow})`
                  : colors.gray200,
                borderRadius: "4px 4px 0 0",
              }} />
              <span style={{ fontSize: 8, color: colors.textLight, fontFamily: fonts.body }}>
                {dia.dia}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
    <BottomNav active="dashboard" onNav={onNav} items={gestorNav} />
  </PhoneFrame>
);