import { useEffect, useState } from "preact/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useScanQR } from "../providers/AsistenciasProvider";
import { colors, fonts } from "../tokens";

export const AsistenciaQRScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth, isLoading: authLoading } = useAuth();
  const { scan, loading, error, resultado } = useScanQR();
  const [done, setDone] = useState(false);

  const qr = searchParams.get("qr");

  // Una vez que tengamos auth y el qr payload, registrar automáticamente
  useEffect(() => {
    if (authLoading || done) return;

    // Sin sesión → redirigir al login conservando la URL de retorno
    if (!auth) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
      return;
    }

    // Solo las familias pueden registrar asistencia
    if (auth.user.role !== "familia") {
      navigate("/gestor", { replace: true });
      return;
    }

    if (!qr) {
      navigate("/familia", { replace: true });
      return;
    }

    setDone(true);
    scan(qr);
  }, [authLoading, auth, qr, done]);

  // ── Pantalla de carga inicial ───────────────────────────────────────────────
  if (authLoading || (!resultado && !error && !done)) {
    return (
      <div style={{
        height: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: colors.offWhite, gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>📷</div>
        <div style={{ fontSize: 14, color: colors.textLight, fontFamily: fonts.body }}>
          Verificando código QR…
        </div>
      </div>
    );
  }

  // ── Registrando ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        height: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: colors.offWhite, gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>⏳</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body }}>
          Registrando asistencia…
        </div>
      </div>
    );
  }

  // ── Éxito ──────────────────────────────────────────────────────────────────
  if (resultado) {
    return (
      <div style={{
        height: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: colors.offWhite, padding: 32, gap: 0,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.greenLight}, #f0fff4)`,
          borderRadius: 24, padding: "40px 28px",
          textAlign: "center", width: "100%", maxWidth: 400,
          border: `1px solid ${colors.green}40`,
          boxShadow: `0 8px 32px ${colors.green}20`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 64 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: colors.green, fontFamily: fonts.body }}>
            ¡Asistencia registrada!
          </div>
          <div style={{ fontSize: 13, color: colors.textLight, fontFamily: fonts.body, lineHeight: 1.6 }}>
            Tu presencia en la actividad quedó registrada exitosamente.
          </div>
          <button
            onClick={() => navigate("/familia/actividades")}
            style={{
              marginTop: 12, padding: "13px 32px",
              background: colors.teal, border: "none", borderRadius: 14,
              color: "white", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: fonts.body,
              boxShadow: `0 4px 14px ${colors.teal}50`,
            }}
          >
            Ver actividades
          </button>
          <button
            onClick={() => navigate("/familia")}
            style={{
              padding: "10px 24px", background: "transparent",
              border: `1px solid ${colors.gray300}`, borderRadius: 10,
              color: colors.textLight, fontSize: 12, cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: colors.offWhite, padding: 32,
    }}>
      <div style={{
        background: "#FFF0F3", borderRadius: 24, padding: "40px 28px",
        textAlign: "center", width: "100%", maxWidth: 400,
        border: `1px solid ${colors.pinkDark}30`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontSize: 64 }}>❌</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: colors.pinkDark, fontFamily: fonts.body }}>
          No se pudo registrar
        </div>
        <div style={{ fontSize: 13, color: colors.pinkDark, fontFamily: fonts.body, opacity: 0.8, lineHeight: 1.6 }}>
          {error ?? "El código QR no es válido o ya fue usado."}
        </div>
        <button
          onClick={() => navigate("/familia/escanear-qr")}
          style={{
            marginTop: 12, padding: "13px 32px",
            background: colors.teal, border: "none", borderRadius: 14,
            color: "white", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: fonts.body,
          }}
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => navigate("/familia")}
          style={{
            padding: "10px 24px", background: "transparent",
            border: `1px solid ${colors.gray300}`, borderRadius: 10,
            color: colors.textLight, fontSize: 12, cursor: "pointer",
            fontFamily: fonts.body,
          }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
};
