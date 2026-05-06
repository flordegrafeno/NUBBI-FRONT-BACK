// ─── PANTALLA COMUNIDAD — FLUJO FAMILIA ──────────────────────────────────────
// Chat y contactos. Tiene dos tabs: "Chats" y "Contactos".
// Juan puede ver sus conversaciones con gestores y grupos familiares.

import { useState } from "preact/hooks";
import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, familiaNav } from "../../components/BottomNav";
import type { ScreenProps } from "../../types";

// Datos de ejemplo — luego tu compañero los conecta al backend
const contactos = [
  { name: "Gestor Santamaria", msg: "Hola, te esperamos en la experiencia esta...", time: "10:24", avatar: "👩‍💼", unread: 2 },
  { name: "Papá",              msg: "Hola hijo ¿cómo estás?",                      time: "09:15", avatar: "👨",   unread: 0 },
];

const chats = [
  { name: "Grupo Mi Hogar Avanza", msg: "Muchas gracias por la iniciativa de...", time: "10:30", avatar: "🏠", unread: 5 },
  { name: "Mamá",                  msg: "Ok amor, hasta luego",                   time: "08:45", avatar: "👩", unread: 0 },
];

export const ComunidadScreen = ({ onNav }: ScreenProps) => {
  // Tab activo: "chats" o "contactos"
  const [tab, setTab] = useState<"chats" | "contactos">("chats");

  const items = tab === "contactos" ? contactos : chats;

  return (
    <PhoneFrame>
      <TopBar onBack={() => onNav("home-familia")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header con gradiente y tabs */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`,
          padding: "16px 20px",
          color: "white",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fonts.body }}>
            Comunidad Nubbi
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
            Conversa con tus contactos y crea un chat grupal con tu familia.
          </div>

          {/* Tabs de Chats / Contactos */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 3,
            marginTop: 12,
            gap: 2,
          }}>
            {(["chats", "contactos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 16,
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? colors.teal : "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  fontFamily: fonts.body,
                  transition: "all 0.2s",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Etiqueta de sección */}
        <div style={{ padding: "10px 16px 4px", background: colors.gray100, flexShrink: 0 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: colors.textLight,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: fonts.body,
          }}>
            {tab === "contactos" ? "Cerca de ti" : "Mis chats"}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: `1px solid ${colors.gray100}`,
              cursor: "pointer",
            }}>
              {/* Avatar */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.teal}30, ${colors.blue}30)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}>
                {item.avatar}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: colors.text, fontFamily: fonts.body }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                    {item.time}
                  </span>
                </div>
                {/* Último mensaje, cortado si es largo */}
                <div style={{
                  fontSize: 11,
                  color: colors.textLight,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: fonts.body,
                }}>
                  {item.msg}
                </div>
              </div>

              {/* Badge de mensajes sin leer */}
              {item.unread > 0 && (
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: colors.orange,
                  color: "white",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: fonts.body,
                }}>
                  {item.unread}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón flotante para nuevo chat */}
        <button style={{
          position: "absolute",
          bottom: 72,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: colors.orange,
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          color: "white",
          boxShadow: `0 4px 14px ${colors.orange}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          +
        </button>

      </div>
      <BottomNav active="comunidad" onNav={onNav} items={familiaNav} />
    </PhoneFrame>
  );
};