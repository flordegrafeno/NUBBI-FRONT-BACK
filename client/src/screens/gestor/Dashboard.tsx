import { useState, useEffect } from "preact/hooks";
import { colors, fonts } from "../../tokens";
import { TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import { getActividades } from "../../api/actividades";
import { getInteraccionesByActividad, type Interaccion } from "../../api/interacciones";

interface AidaData {
  label: string;
  valor: number;
  color: string;
}

const calcAida = (interacciones: Interaccion[]): AidaData[] => {
  const total = interacciones.length;
  const pct = (count: number) => total === 0 ? 0 : Math.round((count / total) * 100);
  return [
    { label: "Atención", valor: pct(interacciones.filter((i) => i.atencion).length), color: colors.blue },
    { label: "Interés",  valor: pct(interacciones.filter((i) => i.interes).length),  color: colors.orange },
    { label: "Deseo",    valor: pct(interacciones.filter((i) => i.deseo).length),    color: colors.pink },
    { label: "Acción",   valor: pct(interacciones.filter((i) => i.accion).length),   color: colors.teal },
  ];
};

export const DashboardScreen = () => {
  const [aida, setAida] = useState<AidaData[]>([
    { label: "Atención", valor: 0, color: colors.blue },
    { label: "Interés",  valor: 0, color: colors.orange },
    { label: "Deseo",    valor: 0, color: colors.pink },
    { label: "Acción",   valor: 0, color: colors.teal },
  ]);
  const [totalActividades, setTotalActividades] = useState(0);
  const [totalInteracciones, setTotalInteracciones] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const acts = await getActividades();
        setTotalActividades(acts.length);
        if (acts.length === 0) { setLoading(false); return; }

        const allInteracciones: Interaccion[] = [];
        await Promise.all(
          acts.map((act) =>
            getInteraccionesByActividad(act.id)
              .then((ints) => allInteracciones.push(...ints))
              .catch(() => {})
          )
        );
        setTotalInteracciones(allInteracciones.length);
        setAida(calcAida(allInteracciones));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{
        flex: 1,
        overflowY: "auto",
        background: colors.offWhite,
        padding: "12px 14px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>

        {/* Header */}
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
              Análisis de compromiso AIDA
            </div>
          </div>
          {loading && (
            <div style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", fontFamily: fonts.body }}>
              Cargando...
            </div>
          )}
        </div>

        {/* Métricas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🎯", valor: String(totalActividades),        label: "Actividades",     color: colors.blue,   bg: colors.blueLight       },
            { icon: "💬", valor: String(totalInteracciones),      label: "Interacciones",   color: colors.teal,   bg: colors.tealLight       },
            { icon: "📊", valor: `${aida[3]?.valor ?? 0}%`,      label: "Tasa de acción",  color: colors.orange, bg: colors.orangeVeryLight },
            { icon: "⭐", valor: `${aida[1]?.valor ?? 0}%`,      label: "Tasa de interés", color: colors.pink,   bg: "#FFF0F3"              },
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
                <div style={{ height: 8, background: colors.gray200, borderRadius: 4 }}>
                  <div style={{
                    width: `${etapa.valor}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${etapa.color}80, ${etapa.color})`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>

          {!loading && totalInteracciones === 0 && (
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
