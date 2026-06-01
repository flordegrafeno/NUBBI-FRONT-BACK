import { useState, useRef, useEffect, useCallback } from "preact/hooks";
import { colors, fonts } from "../../tokens";
import { TopBar } from "../../components/PhoneFrame";
import { BottomNav, familiaNav } from "../../components/BottomNav";
import { useScanQR } from "../../providers/AsistenciasProvider";
// @ts-ignore
import jsQR from "jsqr";

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type ScanMode = "camera" | "manual";
type CameraState = "idle" | "requesting" | "active" | "denied" | "unsupported";
type FacingMode = "environment" | "user";

interface ScanHistoryEntry {
  payload: string;
  timestamp: Date;
  success: boolean;
  errorMsg?: string;
}

// ─── HOOK: Escáner QR con cámara ─────────────────────────────────────────────

const useQRScanner = (
  onDetected: (payload: string) => void,
  active: boolean,
  facingMode: FacingMode,
  torchEnabled: boolean
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const fpsCounterRef
 = useRef({ frames: 0, lastTime: performance.now() });

  // Ref para el callback — mantiene scanFrame estable sin importar re-renders
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    detectedRef.current = false;
    setCameraState("idle");
  }, []);

  // Sin dependencias: scanFrame es estable durante toda la vida del hook
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    fpsCounterRef.current.frames++;
    if (performance.now() - fpsCounterRef.current.lastTime >= 1000) {
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = performance.now();
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code?.data && !detectedRef.current) {
      detectedRef.current = true;
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      onDetectedRef.current(code.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle linterna
  useEffect(() => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    const caps = track.getCapabilities?.() as any;
    if (caps?.torch) {
      track.applyConstraints?.({ advanced: [{ torch: torchEnabled } as any] } as any).catch(() => {});
    }
  }, [torchEnabled]);

  // Iniciar / reiniciar cámara cuando cambia facingMode
  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }
    // Parar stream anterior antes de pedir uno nuevo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectedRef.current = false;
    setCameraState("requesting");

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            setCameraState("active");
            rafRef.current = requestAnimationFrame(scanFrame);
          });
        }
      })
      .catch(() => setCameraState("denied"));

    return () => stopCamera();
  }, [active, facingMode, stopCamera]); // scanFrame es estable (ref pattern)

  return { videoRef, canvasRef, cameraState, stopCamera };
};


// ─── UTILS ───────────────────────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const truncate = (s: string, max = 36) =>
  s.length > max ? s.slice(0, max) + "…" : s;

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export const EscanearQRScreen = () => {
  // Modo activo
  const [mode, setMode] = useState<ScanMode>("camera");

  // Estado cámara
  const [scannedPayload, setScannedPayload] = useState<string | null>(null);

  // Modo manual
  const [payload, setPayload] = useState("");

  // Historial de sesión
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Overlay tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // API hook
  const { scan, loading, error, resultado, reset: resetScanResult } = useScanQR();

  // ─── Lógica de detección ───────────────────────────────────────────────────

  const handleDetected = useCallback(
    async (value: string) => {
      setScannedPayload(value);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      try {
        await scan(value);
        setHistory((prev) => [
          { payload: value, timestamp: new Date(), success: true },
          ...prev.slice(0, 19),
        ]);
      } catch (err: any) {
        setHistory((prev) => [
          {
            payload: value,
            timestamp: new Date(),
            success: false,
            errorMsg: err?.message ?? "Error desconocido",
          },
          ...prev.slice(0, 19),
        ]);
      }
    },
    [scan]
  );

  const resetScan = () => {
    setScannedPayload(null);
    resetScanResult();
  };

  const cameraActive = mode === "camera" && !scannedPayload && !resultado;

  const { videoRef, canvasRef, cameraState } = useQRScanner( // eslint-disable-line
    handleDetected,
    cameraActive,
    "environment",
    false
  );

  // ─── Manual ───────────────────────────────────────────────────────────────

  const handleManualSubmit = async (e: Event) => {
    e.preventDefault();
    if (!payload.trim()) return;
    await handleDetected(payload.trim());
    setPayload("");
  };

  // ─── Flipcámara ────────────────────────────────────────────────────────────

  // ─── Tutorial steps ────────────────────────────────────────────────────────

  const tutorialSteps = [
    { icon: "📷", title: "Modo Cámara", desc: "Apunta la cámara al código QR y se detectará automáticamente sin tocar nada." },
    { icon: "✏️", title: "Modo Manual", desc: "Si el gestor te compartió el código en texto, puedes pegarlo directamente aquí." },
  ];

  const succeeded = !!resultado;

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />

      {/* ── TUTORIAL OVERLAY ──────────────────────────────────────────────── */}
      {showTutorial && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => {
            if (tutorialStep < tutorialSteps.length - 1) setTutorialStep((s) => s + 1);
            else { setShowTutorial(false); setTutorialStep(0); }
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 28,
              maxWidth: 320,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {tutorialSteps[tutorialStep].icon}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: colors.text, fontFamily: fonts.body, marginBottom: 8 }}>
              {tutorialSteps[tutorialStep].title}
            </div>
            <div style={{ fontSize: 13, color: colors.textLight, fontFamily: fonts.body, lineHeight: 1.6, marginBottom: 20 }}>
              {tutorialSteps[tutorialStep].desc}
            </div>
            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setTutorialStep(i)}
                  style={{
                    width: i === tutorialStep ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === tutorialStep ? colors.teal : colors.gray300,
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowTutorial(false); setTutorialStep(0); }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: colors.gray100,
                  border: "none",
                  borderRadius: 10,
                  color: colors.textLight,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Saltar
              </button>
              <button
                onClick={() => {
                  if (tutorialStep < tutorialSteps.length - 1) setTutorialStep((s) => s + 1);
                  else { setShowTutorial(false); setTutorialStep(0); }
                }}
                style={{
                  flex: 2,
                  padding: "10px 0",
                  background: colors.teal,
                  border: "none",
                  borderRadius: 10,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                {tutorialStep < tutorialSteps.length - 1 ? "Siguiente →" : "¡Entendido!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORIAL OVERLAY ─────────────────────────────────────────────── */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 90,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px 20px 0 0",
              padding: "20px 0 32px",
              maxHeight: "70vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.gray200}` }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: colors.text, fontFamily: fonts.body }}>
                📋 Historial de sesión
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    style={{ background: "none", border: "none", fontSize: 11, color: colors.pinkDark, cursor: "pointer", fontFamily: fonts.body }}
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  style={{ background: colors.gray100, border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: fonts.body }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {history.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: colors.textLight, fontFamily: fonts.body, fontSize: 13 }}>
                  No hay escaneos en esta sesión aún
                </div>
              ) : (
                history.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 20px",
                      borderBottom: `1px solid ${colors.gray100}`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: entry.success ? colors.greenLight : "#FFF0F3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {entry.success ? "✅" : "❌"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, fontFamily: fonts.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {truncate(entry.payload, 32)}
                      </div>
                      <div style={{ fontSize: 10, color: entry.success ? colors.green : colors.pinkDark, fontFamily: fonts.body, marginTop: 2 }}>
                        {entry.success ? "Registrado exitosamente" : entry.errorMsg ?? "Error"}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body, flexShrink: 0 }}>
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: mode === "camera" && !succeeded ? "#0d0d1a" : colors.offWhite,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`,
            padding: "14px 20px 16px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: fonts.body }}>
                Escanear código QR
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
                Registra tu asistencia a la actividad
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                📋 {history.length > 0 ? history.length : ""}
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                ?
              </button>
            </div>
          </div>

          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 3,
              marginTop: 12,
              gap: 2,
            }}
          >
            {([
              { id: "camera", label: "📷 Cámara" },
              { id: "manual", label: "✏️ Manual" },
            ] as { id: ScanMode; label: string }[]).map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); resetScan(); }}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 16,
                  background: mode === m.id ? "white" : "transparent",
                  color: mode === m.id ? colors.teal : "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 11,
                  fontFamily: fonts.body,
                  transition: "all 0.2s",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        {history.length > 0 && (
          <div
            style={{
              background: "white",
              borderBottom: `1px solid ${colors.gray100}`,
              padding: "8px 20px",
              display: "flex",
              gap: 20,
            }}
          >
            {[
              { label: "Total", value: history.length, color: colors.blue },
              { label: "Exitosos", value: history.filter((h) => h.success).length, color: colors.green },
              { label: "Fallidos", value: history.filter((h) => !h.success).length, color: colors.pinkDark },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: fonts.body }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 9, color: colors.textLight, fontFamily: fonts.body }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={
          mode === "camera" && !succeeded
            ? { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }
            : { flex: 1, overflowY: "auto", padding: 16, paddingBottom: 80, display: "flex", flexDirection: "column", gap: 14 }
        }>

          {/* ── SUCCESS ───────────────────────────────────────────────────── */}
          {succeeded && (
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.greenLight}, #f0fff4)`,
                borderRadius: 20,
                padding: "28px 20px",
                textAlign: "center",
                border: `1px solid ${colors.green}40`,
                boxShadow: `0 4px 20px ${colors.green}20`,
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: colors.green, fontFamily: fonts.body }}>
                ¡Asistencia registrada!
              </div>
              <div style={{ fontSize: 12, color: colors.textLight, fontFamily: fonts.body, marginTop: 6, lineHeight: 1.5 }}>
                Tu asistencia fue registrada con éxito.
                <br />
                Puedes escanear otro código cuando quieras.
              </div>
              {scannedPayload && (
                <div
                  style={{
                    marginTop: 14,
                    background: "white",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 11,
                    color: colors.textLight,
                    fontFamily: fonts.body,
                    wordBreak: "break-all",
                    border: `1px solid ${colors.gray200}`,
                  }}
                >
                  <strong>Código:</strong> {truncate(scannedPayload, 50)}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  onClick={() => setShowHistory(true)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "white",
                    border: `1px solid ${colors.green}`,
                    borderRadius: 12,
                    color: colors.green,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  Ver historial
                </button>
                <button
                  onClick={resetScan}
                  style={{
                    flex: 2,
                    padding: "10px 0",
                    background: colors.teal,
                    border: "none",
                    borderRadius: 12,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  Escanear otro
                </button>
              </div>
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {error && !succeeded && (
            <div
              style={{
                background: "#FFF0F3",
                borderRadius: 14,
                padding: "16px",
                border: `1px solid ${colors.pinkDark}30`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: colors.pinkDark, fontFamily: fonts.body }}>
                    Error al registrar
                  </div>
                  <div style={{ fontSize: 12, color: colors.pinkDark, fontFamily: fonts.body, marginTop: 4, opacity: 0.8 }}>
                    {error}
                  </div>
                </div>
              </div>
              <button
                onClick={resetScan}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "9px 0",
                  background: "none",
                  border: `1px solid ${colors.pinkDark}`,
                  borderRadius: 8,
                  color: colors.pinkDark,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* ── MODO CÁMARA ──────────────────────────────────────────────── */}
          {mode === "camera" && !succeeded && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Visor */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                  background: "#0d0d1a",
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: cameraState === "active" ? "block" : "none",
                  }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />


                {/* Estados de cámara */}
                {cameraState !== "active" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 14,
                      background: "#0d0d1a",
                      color: "white",
                      textAlign: "center",
                      padding: 28,
                    }}
                  >
                    {cameraState === "requesting" && (
                      <>
                        <div style={{ fontSize: 36 }}>📷</div>
                        <div style={{ fontSize: 13, fontFamily: fonts.body, opacity: 0.75, lineHeight: 1.5 }}>
                          Solicitando permiso de cámara…
                          <br />
                          <span style={{ fontSize: 11, opacity: 0.5 }}>Acepta la solicitud en tu navegador</span>
                        </div>
                      </>
                    )}
                    {cameraState === "denied" && (
                      <>
                        <div style={{ fontSize: 36 }}>🚫</div>
                        <div style={{ fontSize: 13, fontFamily: fonts.body, opacity: 0.8, lineHeight: 1.6 }}>
                          Permiso de cámara denegado.
                          <br />
                          <span style={{ fontSize: 11, opacity: 0.6 }}>Ve a Configuración → Privacidad → Cámara</span>
                        </div>
                        <button
                          onClick={() => setMode("manual")}
                          style={{
                            padding: "10px 20px",
                            background: colors.teal,
                            border: "none",
                            borderRadius: 10,
                            color: "white",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: fonts.body,
                          }}
                        >
                          Ingresar código manual
                        </button>
                      </>
                    )}
                    {cameraState === "unsupported" && (
                      <>
                        <div style={{ fontSize: 36 }}>⚠️</div>
                        <div style={{ fontSize: 13, fontFamily: fonts.body, opacity: 0.8 }}>
                          Tu navegador no soporta acceso a la cámara.
                        </div>
                        <button
                          onClick={() => setMode("manual")}
                          style={{
                            padding: "10px 20px",
                            background: colors.teal,
                            border: "none",
                            borderRadius: 10,
                            color: "white",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: fonts.body,
                          }}
                        >
                          Usar modo manual
                        </button>
                      </>
                    )}
                    {cameraState === "idle" && (
                      <>
                        <div style={{ fontSize: 36 }}>📷</div>
                        <div style={{ fontSize: 12, fontFamily: fonts.body, opacity: 0.5 }}>
                          Iniciando cámara…
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Overlay de procesando */}
                {loading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.65)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      color: "white",
                    }}
                  >
                    <div style={{ fontSize: 32 }}>⏳</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: fonts.body }}>
                      Registrando asistencia…
                    </div>
                  </div>
                )}

                {/* Badge de cámara activa */}
                {cameraState === "active" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.55)",
                      color: "white",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 10,
                      fontFamily: fonts.body,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div className="qr-dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                    Cámara activa
                  </div>
                )}
              </div>

              {cameraState === "active" && !scannedPayload && (
                <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: colors.textLight, fontFamily: fonts.body }}>
                  Centra el código QR dentro del recuadro · detección automática
                </div>
              )}

            </div>
          )}

          {/* ── MODO MANUAL ──────────────────────────────────────────────── */}
          {mode === "manual" && !succeeded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #0d0d1a, #1a1a3e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 38, marginBottom: 6 }}>⌨️</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
                    Ingresa el código proporcionado por el gestor
                  </div>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <textarea
                    placeholder="Pega o escribe el código QR aquí…"
                    value={payload}
                    onInput={(e) => setPayload((e.target as HTMLTextAreaElement).value)}
                    rows={3}
                    style={{
                      width: "100%",
                      background: "white",
                      borderRadius: 12,
                      padding: "12px 14px",
                      border: `1px solid ${payload ? colors.teal : colors.gray200}`,
                      fontSize: 13,
                      fontFamily: fonts.body,
                      color: colors.text,
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "none",
                      lineHeight: 1.5,
                      transition: "border-color 0.2s",
                    }}
                  />
                  {payload && (
                    <button
                      type="button"
                      onClick={() => setPayload("")}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: colors.gray200,
                        border: "none",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.textLight,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Contador de caracteres */}
                <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body, textAlign: "right", marginTop: -6 }}>
                  {payload.length} caracteres
                </div>

                {/* Botón pegar desde portapapeles */}
                {navigator.clipboard?.readText && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setPayload(text);
                      } catch {
                        // permisos
                      }
                    }}
                    style={{
                      padding: "10px 0",
                      background: "white",
                      border: `1px solid ${colors.gray200}`,
                      borderRadius: 12,
                      color: colors.text,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: fonts.body,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    📋 Pegar desde portapapeles
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || !payload.trim()}
                  style={{
                    padding: "13px 0",
                    background: loading || !payload.trim() ? colors.gray300 : colors.teal,
                    border: "none",
                    borderRadius: 12,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: loading || !payload.trim() ? "not-allowed" : "pointer",
                    fontFamily: fonts.body,
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? "Registrando…" : "✅ Registrar asistencia"}
                </button>
              </form>
            </div>
          )}


          {/* ── TIPS ─────────────────────────────────────────────────────── */}
          {!succeeded && (
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.tealLight}, #f0fdfa)`,
                borderRadius: 14,
                padding: 14,
                border: `1px solid ${colors.teal}30`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.teal, fontFamily: fonts.body, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                💡 Consejos
              </div>
              {[
                "Mantén el código QR dentro del recuadro de escaneo",
                "Si hay poca luz, activa la linterna del dispositivo",
                "Asegúrate de que el código no esté borroso o dañado",
                "Asegúrate de estar en un lugar con buena iluminación",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < 3 ? 6 : 0 }}>
                  <span style={{ fontSize: 10, color: colors.teal, marginTop: 1 }}>▸</span>
                  <span style={{ fontSize: 11, color: colors.teal, fontFamily: fonts.body, opacity: 0.85, lineHeight: 1.4 }}>
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <BottomNav items={familiaNav} />
    </div>
  );
};