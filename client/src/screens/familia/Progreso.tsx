// ─── PANTALLA PROGRESO — FLUJO FAMILIA ───────────────────────────────────────
// Mapa de aventura con paradas. Juan ve en qué punto del recorrido está
// su familia y qué actividades ha completado.

import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, familiaNav } from "../../components/BottomNav";
import { NubbiOwl } from "../../components/NubbiLogo";
import type { ScreenProps } from "../../types";

// Cada parada del mapa de aventura
const paradas = [
  {
    x: 60,  y: 80,
    label: "Taller de pintura\ny pláticas",
    completada: true,
    actual: false,
  },
  {
    x: 180, y: 160,
    label: "Taller de Danza\ny presencia",
    completada: false,
    actual: true, // aquí está Juan ahora
  },
  {
    x: 80,  y: 260,
    label: "Próximo evento",
    completada: false,
    actual: false,
  },
  {
    x: 200, y: 350,
    label: "Bonus final",
    completada: false,
    actual: false,
  },
];

export const ProgresoScreen = ({ onNav }: ScreenProps) => (
  <PhoneFrame bgColor="#FFF9E0">
    <TopBar onBack={() => onNav("home-familia")} title="Progreso" />

    {/* Barra de progreso general */}
    <div style={{
      background: "white",
      padding: "10px 16px",
      borderBottom: `1px solid ${colors.gray200}`,
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        marginBottom: 6,
        fontFamily: fonts.body,
      }}>
        <span style={{ fontWeight: 600, color: colors.text }}>Tu aventura</span>
        <span style={{ fontWeight: 700, color: colors.orange }}>40 / 200 pts</span>
      </div>
      {/* Barra de progreso */}
      <div style={{ height: 8, background: colors.gray200, borderRadius: 4 }}>
        <div style={{
          width: "20%", // 40 de 200 puntos = 20%
          height: "100%",
          borderRadius: 4,
          background: `linear-gradient(90deg, ${colors.orange}, ${colors.yellow})`,
        }} />
      </div>
    </div>

    {/* Mapa de aventura */}
    <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>

      {/* Fondo degradado: cielo → pasto */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(
          180deg,
          #87CEEB 0%,
          #B0E0FF 25%,
          #FFF9C4 45%,
          #8BC34A 70%,
          #4CAF50 100%
        )`,
      }} />

      {/* Nubes decorativas */}
      {[
        { left: 10,  top: 20 },
        { left: 160, top: 45 },
        { left: 60,  top: 75 },
      ].map((nube, i) => (
        <div key={i} style={{
          position: "absolute",
          left: nube.left,
          top: nube.top,
          width: 50,
          height: 22,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 20,
          boxShadow: "12px 0 0 8px rgba(255,255,255,0.85), -12px 0 0 8px rgba(255,255,255,0.85)",
        }} />
      ))}

      {/* Camino punteado entre paradas */}
      <svg
        style={{ position: "absolute", width: "100%", height: 420 }}
        viewBox="0 0 280 420"
      >
        {/* Camino blanco grueso de fondo */}
        <path
          d="M 70 90 Q 180 120 190 170 Q 200 220 90 260 Q 50 285 210 360"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Camino naranja punteado encima */}
        <path
          d="M 70 90 Q 180 120 190 170 Q 200 220 90 260 Q 50 285 210 360"
          fill="none"
          stroke={colors.orange}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
      </svg>

      {/* Paradas del mapa */}
      {paradas.map((parada, i) => (
        <div key={i} style={{
          position: "absolute",
          left: parada.x - 30,
          top: parada.y - 30,
        }}>
          {/* Etiqueta de texto */}
          <div style={{
            position: "absolute",
            // Si es la parada actual la ponemos a la derecha, sino a la izquierda
            left: parada.actual ? 52 : undefined,
            right: parada.actual ? undefined : -85,
            top: -8,
            background: "white",
            borderRadius: 10,
            padding: "5px 8px",
            fontSize: 8,
            fontWeight: 700,
            color: colors.text,
            whiteSpace: "pre-line",
            lineHeight: 1.4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            width: 78,
            border: parada.actual
              ? `2px solid ${colors.orange}`
              : `1px solid ${colors.gray200}`,
            fontFamily: fonts.body,
          }}>
            {parada.label}
          </div>

          {/* Nodo circular de la parada */}
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: parada.completada
              ? colors.orange
              : parada.actual
                ? `linear-gradient(135deg, ${colors.orange}, ${colors.yellow})`
                : "rgba(255,255,255,0.6)",
            border: parada.actual
              ? `4px solid ${colors.yellow}`
              : parada.completada
                ? "3px solid white"
                : `3px solid ${colors.gray300}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Brillo extra en la parada actual
            boxShadow: parada.actual
              ? `0 0 0 6px rgba(255,215,0,0.3), 0 4px 12px rgba(0,0,0,0.15)`
              : "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: parada.completada ? 22 : 18,
          }}>
            {parada.completada
              ? "✓"
              : parada.actual
                ? <NubbiOwl size={44} />
                : "🔒"
            }
          </div>
        </div>
      ))}

      {/* Flores y mariposas decorativas */}
      <div style={{ position: "absolute", bottom: 20, left: 30,  fontSize: 26 }}>🌺</div>
      <div style={{ position: "absolute", bottom: 45, right: 20, fontSize: 22 }}>🌻</div>
      <div style={{ position: "absolute", top: 210, left: 12,   fontSize: 18 }}>🦋</div>
      <div style={{ position: "absolute", top: 310, right: 30,  fontSize: 16 }}>🌸</div>
    </div>

    <BottomNav active="progreso" onNav={onNav} items={familiaNav} />
  </PhoneFrame>
);