import { useNavigate } from "react-router-dom";
import { NubbiOwl } from "../../components/NubbiLogo";
import { TopBar } from "../../components/PhoneFrame";
import { BottomNav, gestorNav } from "../../components/BottomNav";
import { colors, fonts } from "../../tokens";
import { useAuth } from "../../context/AuthContext";

export const PerfilGestor = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height:"100vh" }}>
      <TopBar/>
      <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite, paddingBottom: 64 }}>

        {/* Banner de bienvenida */}
        <div style={{
          background: colors.teal,
          padding: "20px 20px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.08, fontSize: 120 }}>
            ⚙️
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
              <NubbiOwl size={44} />
            </div>

            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: fonts.body }}>
                Panel de control
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
                {user?.full_name ?? "Gestor"}
              </div>
            </div>
          </div>

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

        {/* Contenido del perfil */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Botón cerrar sesión */}
          <button
            onClick={handleLogout}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "13px 0",
              background: "white",
              border: `2px solid ${colors.gray300}`,
              borderRadius: 12,
              color: colors.gray700,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: fonts.body,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>

      </div>
      <BottomNav items={gestorNav} />
    </div>
  );
};
