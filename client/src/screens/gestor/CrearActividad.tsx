import { useState, useEffect } from "preact/hooks";
import { colors, fonts } from "../../tokens";
import { TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import { createActividad, getActividades, type Actividad } from "../../api/actividades";

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 12,
  border: `1px solid ${colors.gray300}`,
  background: "white",
  outline: "none",
  color: colors.text,
  fontFamily: fonts.body,
  width: "100%",
  boxSizing: "border-box" as const,
};

export const CrearActividadScreen = () => {
  const [tab, setTab] = useState<"crear" | "historial">("crear");

  // form fields
  const [titulo, setTitulo] = useState("");
  const [desc, setDesc] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // historial
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    if (tab === "historial") {
      setLoadingHist(true);
      getActividades().then(setActividades).catch(console.error).finally(() => setLoadingHist(false));
    }
  }, [tab]);

  const handleCrear = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setExito(false);
    setLoading(true);
    try {
      await createActividad({
        titulo,
        descripcion: desc || undefined,
        fecha: new Date(fecha).toISOString(),
        ubicacion: lugar || undefined,
      });
      setExito(true);
      setTitulo("");
      setDesc("");
      setFecha("");
      setLugar("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la actividad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: colors.pink, padding: "14px 20px", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
            Actividades
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2, fontFamily: fonts.body }}>
            Las actividades se comparten directamente a los usuarios de Nubbi
          </div>

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

        <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 64, background: colors.offWhite }}>

          {tab === "crear" && (
            <form onSubmit={handleCrear} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                placeholder="*Título"
                value={titulo}
                onInput={(e) => setTitulo((e.target as HTMLInputElement).value)}
                required
                style={inputStyle}
              />

              <textarea
                placeholder="Descripción de la actividad"
                value={desc}
                onInput={(e) => setDesc((e.target as HTMLTextAreaElement).value)}
                style={{
                  ...inputStyle,
                  resize: "none",
                  height: 70,
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, border: `1px solid ${colors.gray300}`, padding: "8px 12px" }}>
                <span style={{ fontSize: 14 }}>📅</span>
                <input
                  type="datetime-local"
                  value={fecha}
                  onInput={(e) => setFecha((e.target as HTMLInputElement).value)}
                  required
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 12,
                    color: fecha ? colors.text : colors.textLight,
                    fontFamily: fonts.body,
                    background: "transparent",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, border: `1px solid ${colors.gray300}`, padding: "8px 12px" }}>
                <span style={{ fontSize: 14 }}>📍</span>
                <input
                  placeholder="Lugar"
                  value={lugar}
                  onInput={(e) => setLugar((e.target as HTMLInputElement).value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 12,
                    color: colors.text,
                    fontFamily: fonts.body,
                    background: "transparent",
                  }}
                />
              </div>

              {exito && (
                <div style={{ padding: "10px 14px", background: colors.greenLight, borderRadius: 10, fontSize: 12, color: colors.green, fontFamily: fonts.body, textAlign: "center" }}>
                  ✓ Actividad creada exitosamente
                </div>
              )}
              {error && (
                <div style={{ padding: "10px 14px", background: "#FFF0F3", borderRadius: 10, fontSize: 12, color: colors.pinkDark, fontFamily: fonts.body, textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: 13,
                  background: loading ? colors.gray300 : colors.pinkDark,
                  border: "none",
                  borderRadius: 12,
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: fonts.body,
                  boxShadow: loading ? "none" : `0 4px 14px ${colors.pink}50`,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Creando..." : "📤 Compartir"}
              </button>
            </form>
          )}

          {tab === "historial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingHist && (
                <div style={{ textAlign: "center", padding: 24, color: colors.textLight, fontFamily: fonts.body, fontSize: 12 }}>
                  Cargando...
                </div>
              )}
              {!loadingHist && actividades.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: colors.textLight, fontFamily: fonts.body, fontSize: 12 }}>
                  No hay actividades creadas aún.
                </div>
              )}
              {actividades.map((act) => (
                <div key={act.id} style={{
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
                    flexShrink: 0,
                  }}>
                    🎯
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.text, fontFamily: fonts.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.titulo}
                    </div>
                    <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                      {formatFecha(act.fecha)} · {act.activa ? "Activa" : "Finalizada"}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: act.activa ? colors.green : colors.gray500,
                    fontFamily: fonts.body,
                  }}>
                    {act.puntos} pts
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <BottomNav items={gestorNav} />
    </div>
  );
};
