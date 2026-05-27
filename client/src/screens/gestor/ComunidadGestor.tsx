import { useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../../tokens";
import { TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import { useRooms, useCreateRoom } from "../../providers/ChatProvider";
import { useAuth } from "../../providers/AuthProvider";

export const ComunidadGestorScreen = () => { 
  const navigate = useNavigate();
  const { auth } = useAuth(); 
  const myId = auth?.user.id ?? "";
  const { rooms, loading } = useRooms();
  const { createRoom, loading: creating } = useCreateRoom();
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const room = await createRoom(newRoomName, myId, newRoomDesc);
    if (room) {
      setShowCreate(false);
      setNewRoomName("");
      setNewRoomDesc("");
      navigate(`/gestor/comunidad/${room.id}`, { state: { roomName: room.name } });
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "ahora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />

      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: colors.text, fontFamily: fonts.body, marginBottom: 16 }}>
              Nuevo canal de comunicación
            </div>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                placeholder="Nombre del canal *"
                value={newRoomName}
                onInput={(e) => setNewRoomName((e.target as HTMLInputElement).value)}
                required
                autoFocus
                style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${colors.gray300}`, fontSize: 13, fontFamily: fonts.body, color: colors.text, outline: "none" }}
              />
              <input
                placeholder="Descripción del canal (opcional)"
                value={newRoomDesc}
                onInput={(e) => setNewRoomDesc((e.target as HTMLInputElement).value)}
                style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${colors.gray300}`, fontSize: 13, fontFamily: fonts.body, color: colors.text, outline: "none" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{ flex: 1, padding: "12px 0", background: colors.gray100, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: fonts.body, color: colors.textLight }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creating || !newRoomName.trim()}
                  style={{ flex: 2, padding: "12px 0", background: creating || !newRoomName.trim() ? colors.gray300 : colors.blue, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", fontFamily: fonts.body, color: "white" }}>
                  {creating ? "Creando…" : "Crear canal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: colors.blue, padding: "16px 20px", color: "white", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fonts.body }}>Comunidad Nubbi</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
            Gestiona y modera los canales de comunicación
          </div>
        </div>

        <div style={{ padding: "10px 16px 6px", background: colors.gray100, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: colors.textLight, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: fonts.body }}>
            Canales ({rooms.length})
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: colors.blue, border: "none", borderRadius: 8, padding: "4px 12px", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: fonts.body }}
          >
            + Nuevo
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", background: "white", paddingBottom: 80 }}>
          {loading && (
            <div style={{ padding: 32, textAlign: "center", color: colors.textLight, fontFamily: fonts.body, fontSize: 13 }}>
              Cargando canales…
            </div>
          )}
          {!loading && rooms.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📢</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>No hay canales aún</div>
              <div style={{ fontSize: 12, color: colors.textLight, fontFamily: fonts.body, marginTop: 6 }}>Crea un canal para comunicarte con las familias</div>
            </div>
          )}

          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/gestor/comunidad/${room.id}`, { state: { roomName: room.name } })}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${colors.gray100}`, cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = colors.gray100; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div
                style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.blue}, ${colors.teal})`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}
              >
                📢
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: colors.text, fontFamily: fonts.body }}>{room.name}</span>
                  <span style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>{formatTime(room.created_at)}</span>
                </div>
                <div style={{ fontSize: 11, color: colors.textLight, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: fonts.body }}>
                  {room.description ?? "Canal de comunicación"}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {room.created_by === myId && (
                  <span style={{ fontSize: 9, background: colors.blueLight, color: colors.blue, borderRadius: 6, padding: "2px 6px", fontWeight: 700, fontFamily: fonts.body }}>
                    ADMIN
                  </span>
                )}
                <span style={{ color: colors.gray500, fontSize: 16 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav items={gestorNav} />
    </div>
  );
};