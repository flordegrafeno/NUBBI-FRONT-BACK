// ─── PANTALLA HOME — FLUJO FAMILIA ───────────────────────────────────────────
// Primera pantalla que ve Juan cuando abre la app.
// Muestra saludo, puntos acumulados, menú de opciones y actividad reciente.

import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, familiaNav } from "../../components/BottomNav";
import { NubbiOwl } from "../../components/NubbiLogo";
import type { ScreenProps } from "../../types";

// ── Tarjeta del menú principal ────────────────────────────────────────────────
const MenuCard = ({
  icon,
  label,
  subtitle,
  color,
  bgColor,
  onClick,
}: {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: bgColor,
      border: "none",
      borderRadius: 16,
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 6,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      textAlign: "left",
      width: "100%",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
    }}
  >
    {/* Ícono con fondo de color */}
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    }}>
      {icon}
    </div>
    <div style={{ fontWeight: 700, fontSize: 12, color: colors.text, fontFamily: fonts.body }}>
      {label}
    </div>
    <div style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.3, fontFamily: fonts.body }}>
      {subtitle}
    </div>
  </button>
);

// ── Pantalla principal ────────────────────────────────────────────────────────
export const HomeFamiliaScreen = ({ onNav }: ScreenProps) => (
  <PhoneFrame>
    <TopBar />
    <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite }}>

      {/* Banner de bienvenida con gradiente naranja */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.orangeLight} 100%)`,
        padding: "20px 20px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decoración de fondo */}
        <div style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.15, fontSize: 80 }}>⭐</div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar del usuario */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid rgba(255,255,255,0.6)",
          }}>
            <NubbiOwl size={44} />
          </div>

          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: fonts.body }}>
              ¡Bienvenido de nuevo!
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
              Juan
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, fontFamily: fonts.body }}>
              Participa, aprende y ganen puntos juntos
            </div>
          </div>
        </div>

        {/* Badge de puntos */}
        <div style={{
          marginTop: 14,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 20,
          padding: "6px 14px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ color: "white", fontWeight: 700, fontSize: 13, fontFamily: fonts.body }}>
            1,240 puntos
          </span>
        </div>
      </div>

      {/* Grid del menú principal */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 12, fontFamily: fonts.body }}>
          ¿Qué quieres hacer hoy?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MenuCard
            icon="🎯"
            label="Actividades"
            subtitle="Elige desafíos para tu familia"
            color={colors.orange}
            bgColor={colors.orangeVeryLight}
            onClick={() => onNav("progreso")}
          />
          <MenuCard
            icon="🏆"
            label="Progreso"
            subtitle="Gana puntos y desbloquea premios"
            color={colors.yellow}
            bgColor={colors.yellowLight}
            onClick={() => onNav("progreso")}
          />
          <MenuCard
            icon="👥"
            label="Comunidad"
            subtitle="Conecta con otras familias"
            color={colors.teal}
            bgColor={colors.tealLight}
            onClick={() => onNav("comunidad")}
          />
          <MenuCard
            icon="📷"
            label="Escanear QR"
            subtitle="Registra asistencia y aprende"
            color={colors.blue}
            bgColor={colors.blueLight}
            onClick={() => onNav("escanear-qr")}
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 10, fontFamily: fonts.body }}>
          Actividad reciente
        </div>

        {[
          { icon: "🎨", text: "Taller de pintura completado", time: "Hoy",  pts: "+80pts", color: colors.purple },
          { icon: "📚", text: "Lectura en familia",           time: "Ayer", pts: "+60pts", color: colors.teal   },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "white",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: item.color + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: colors.text, fontFamily: fonts.body }}>
                {item.text}
              </div>
              <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                {item.time}
              </div>
            </div>
            {/* Badge de puntos ganados */}
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: colors.green,
              background: colors.greenLight,
              borderRadius: 8,
              padding: "3px 8px",
              fontFamily: fonts.body,
            }}>
              {item.pts}
            </div>
          </div>
        ))}
      </div>

    </div>
    <BottomNav active="home-familia" onNav={onNav} items={familiaNav} />
  </PhoneFrame>
);