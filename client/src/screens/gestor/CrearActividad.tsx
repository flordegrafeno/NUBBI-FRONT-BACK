// ─── PANTALLA CREAR ACTIVIDAD — FLUJO GESTOR ─────────────────────────────────
// El gestor crea nuevas actividades para compartir con las familias.
// Tiene dos tabs: "Crear" para el formulario e "Historial" para ver las anteriores.

import { useState } from "preact/hooks";
import { colors, fonts } from "../../tokens";
import { PhoneFrame, TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import type { ScreenProps } from "../../types";

export const CrearActividadScreen = ({ onNav }: ScreenProps) => {
  const [tab,      setTab]      = useState<"crear" | "historial">("crear");
  const [titulo,   setTitulo]   = useState("");
  const [subtitulo,setSubtitulo]= useState("");
  const [desc,     setDesc]     = useState("");

  return (
    <PhoneFrame>
      <TopBar onBack={() => onNav("home-gestor")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header rosa con tabs */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.pink}, ${colors.pinkLight})`,
          padding: "14px 20px",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
            Actividades
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: fonts.body }}>
            Las actividades se comparten directamente a los chats usuales de los usuarios y al chat de Mi Hogar Avanza
          </div>

          {/* Tabs Crear / Historial */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 3,
            marginTop: 10,
            gap: 2,
          }}>
            {(["crear", "historial"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 16,
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? colors.pink : "white",
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

        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: colors.offWhite }}>

          {/* ── Tab Crear ── */}
          {tab === "crear" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Zona para subir imagen de portada */}
              <div style={{
                height: 100,
                background: `linear-gradient(135deg, ${colors.pink}15, ${colors.purple}15)`,
                borderRadius: 12,
                border: `2px dashed ${colors.pink}60`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 4,
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 24 }}>📷</span>
                <span style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                  Agregar imagen o portada
                </span>
              </div>

              {/* Campo: Título */}
              <input
                placeholder="*Título"
                value={titulo}
                onChange={(e) => setTitulo((e.target as HTMLInputElement).value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  border: `1px solid ${colors.gray300}`,
                  background: "white",
                  outline: "none",
                  color: colors.text,
                  fontFamily: fonts.body,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />

              {/* Campo: Subtítulo */}
              <input
                placeholder="Título secundario asociado"
                value={subtitulo}
                onChange={(e) => setSubtitulo((e.target as HTMLInputElement).value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  border: `1px solid ${colors.gray300}`,
                  background: "white",
                  outline: "none",
                  color: colors.text,
                  fontFamily: fonts.body,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />

              {/* Campo: Descripción */}
              <textarea
                placeholder="Descripción de la actividad"
                value={desc}
                onChange={(e) => setDesc((e.target as HTMLTextAreaElement).value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  border: `1px solid ${colors.gray300}`,
                  background: "white",
                  outline: "none",
                  color: colors.text,
                  fontFamily: fonts.body,
                  resize: "none",
                  height: 70,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />

              {/* Campos de fecha, hora y lugar */}
              {[
                { icon: "📅", placeholder: "Fecha" },
                { icon: "🕐", placeholder: "Hora"  },
                { icon: "📍", placeholder: "Lugar" },
              ].map((campo, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "white",
                  borderRadius: 10,
                  border: `1px solid ${colors.gray300}`,
                  padding: "8px 12px",
                }}>
                  <span style={{ fontSize: 14 }}>{campo.icon}</span>
                  <span style={{ fontSize: 11, color: colors.textLight, fontFamily: fonts.body }}>
                    {campo.placeholder}
                  </span>
                </div>
              ))}

              {/* Botón compartir */}
              <button style={{
                marginTop: 4,
                padding: 13,
                background: `linear-gradient(135deg, ${colors.pink}, ${colors.pinkLight})`,
                border: "none",
                borderRadius: 12,
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: fonts.body,
                boxShadow: `0 4px 14px ${colors.pink}50`,
              }}>
                📤 Compartir
              </button>
            </div>
          )}

          {/* ── Tab Historial ── */}
          {tab === "historial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { nombre: "Taller de pintura",  dias: 1, participantes: 45 },
                { nombre: "Lectura familiar",   dias: 3, participantes: 38 },
                { nombre: "Paseo al parque",    dias: 7, participantes: 62 },
              ].map((act, i) => (
                <div key={i} style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: colors.pink + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}>
                    🎯
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.text, fontFamily: fonts.body }}>
                      {act.nombre}
                    </div>
                    <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                      Hace {act.dias} {act.dias === 1 ? "día" : "días"} · {act.participantes} participantes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <BottomNav active="crear-actividad" onNav={onNav} items={gestorNav} />
    </PhoneFrame>
  );
};