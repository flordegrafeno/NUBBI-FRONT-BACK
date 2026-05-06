// ─── PANTALLA HOME — FLUJO GESTOR ────────────────────────────────────────────
// Panel principal del Gestor Julian. Ve estadísticas rápidas
// y accede a sus herramientas: actividades, comunidad, QR y dashboard.

import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import { NubbiOwlGestor } from "../../components/NubbiLogo";
import type { ScreenProps } from "../../types";

export const HomeGestorScreen = ({ onNav }: ScreenProps) => (
  <PhoneFrame>
    <TopBar />
    <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite }}>

      {/* Banner de bienvenida del gestor — verde azulado */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.blue} 100%)`,
        padding: "20px 20px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.08, fontSize: 120 }}>
          ⚙️
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar del gestor */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "3px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <NubbiOwlGestor size={44} />
          </div>

          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: fonts.body }}>
              Panel de control
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
              Bienvenido, Gestor Julian
            </div>
          </div>
        </div>

        {/* Fila de estadísticas rápidas */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { val: "124", label: "Familias"    },
            { val: "64%", label: "Asistencia"  },
            { val: "28",  label: "Activos hoy" },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 10,
              padding: "8px 6px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
                {stat.val}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontFamily: fonts.body }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menú de acciones */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 12, fontFamily: fonts.body }}>
          Acciones rápidas
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              icon: "🎯",
              label: "Crear Actividades",
              subtitle: "Comparte nuevas experiencias para que las familias participen y mantengan informadas el tema de las actividades.",
              color:   colors.pink,
              bgColor: colors.pinkVeryLight,
              screen:  "crear-actividad" as const,
            },
            {
              icon: "👥",
              label: "Comunidad",
              subtitle: "Conversa, motiva y responde directamente a las dudas de los hogares.",
              color:   colors.teal,
              bgColor: colors.tealLight,
              screen:  "home-gestor" as const,
            },
            {
              icon: "📷",
              label: "Lector de QR",
              subtitle: "Herramienta de los Eventos para lectura de QR.",
              color:   colors.blue,
              bgColor: colors.blueLight,
              screen:  "home-gestor" as const,
            },
            {
              icon: "📊",
              label: "Dashboard",
              subtitle: "Analiza el compromiso de las familias y el impacto de tus actividades.",
              color:   colors.orange,
              bgColor: colors.orangeVeryLight,
              screen:  "dashboard" as const,
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNav(item.screen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: item.bgColor,
                border: "none",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                width: "100%",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Ícono */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text, fontFamily: fonts.body }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.4, marginTop: 2, fontFamily: fonts.body }}>
                  {item.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
    <BottomNav active="home-gestor" onNav={onNav} items={gestorNav} />
  </PhoneFrame>
);