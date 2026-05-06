// ─── PANTALLA ESCANEAR QR — FLUJO FAMILIA ────────────────────────────────────
// Juan escanea un código QR para registrar asistencia a una actividad.
// Muestra un visor de cámara simulado con el encuadre típico de escaneo.

import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, familiaNav } from "../../components/BottomNav";
import type { ScreenProps } from "../../types";

export const EscanearQRScreen = ({ onNav }: ScreenProps) => (
  <PhoneFrame>
    <TopBar onBack={() => onNav("home-familia")} />
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: colors.offWhite,
      padding: 20,
      overflowY: "auto",
    }}>

      <div style={{ fontSize: 17, fontWeight: 800, color: colors.text, marginBottom: 6, fontFamily: fonts.body }}>
        Escanear código QR
      </div>
      <div style={{ fontSize: 11, color: colors.textLight, textAlign: "center", marginBottom: 24, fontFamily: fonts.body }}>
        Usa tu cámara para escanear el código, toca el link generado para continuar.
      </div>

      {/* Visor de cámara */}
      <div style={{
        width: 220,
        height: 220,
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: "#1a1a2e",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}>
        {/* Fondo oscuro simulando la cámara */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Código QR de ejemplo — luego esto es la cámara real */}
          <img
            src="/qr-example.png"
            alt="QR de ejemplo"
            width={140}
            height={140}
            style={{ opacity: 0.7, objectFit: "contain" }}
            // Si no tienes la imagen, se muestra el fallback de abajo
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* Fallback si no hay imagen: cuadrado verde */}
          <div style={{
            position: "absolute",
            width: 100,
            height: 100,
            border: `3px solid ${colors.teal}`,
            borderRadius: 8,
            opacity: 0.5,
          }} />
        </div>

        {/* Las 4 esquinas del encuadre de escaneo */}
        {[
          { top: 10, left: 10,  borderTop: true,    borderLeft: true  },
          { top: 10, right: 10, borderTop: true,    borderRight: true },
          { bottom: 10, left: 10,  borderBottom: true, borderLeft: true  },
          { bottom: 10, right: 10, borderBottom: true, borderRight: true },
        ].map((corner, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 20,
            height: 20,
            top:    corner.top,
            left:   corner.left,
            right:  corner.right,
            bottom: corner.bottom,
            borderColor: colors.orange,
            borderStyle: "solid",
            borderTopWidth:    corner.borderTop    ? 3 : 0,
            borderLeftWidth:   corner.borderLeft   ? 3 : 0,
            borderRightWidth:  corner.borderRight  ? 3 : 0,
            borderBottomWidth: corner.borderBottom ? 3 : 0,
            borderRadius: 3,
          }} />
        ))}

        {/* Línea de escaneo */}
        <div style={{
          position: "absolute",
          left: 10,
          right: 10,
          height: 2,
          top: "50%",
          background: `linear-gradient(90deg, transparent, ${colors.teal}, transparent)`,
          boxShadow: `0 0 8px ${colors.teal}`,
        }} />
      </div>

      {/* URL detectada */}
      <div style={{
        marginTop: 24,
        width: "100%",
        background: "white",
        borderRadius: 12,
        padding: "10px 14px",
        border: `1px solid ${colors.gray200}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <span style={{ fontSize: 14 }}>🔗</span>
        <span style={{ fontSize: 11, color: colors.textLight, fontFamily: fonts.body }}>
          https://Nubbi-QR.com
        </span>
      </div>

      {/* Opción manual */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
          ¿Problemas para escanear?
        </div>
        <button style={{
          marginTop: 6,
          background: "none",
          border: "none",
          color: colors.orange,
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: fonts.body,
        }}>
          Ingresar código manualmente
        </button>
      </div>

    </div>
    <BottomNav active="escanear-qr" onNav={onNav} items={familiaNav} />
  </PhoneFrame>
);