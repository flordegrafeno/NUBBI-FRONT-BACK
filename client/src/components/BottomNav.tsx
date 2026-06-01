import { useNavigate, useLocation } from "react-router-dom"; 
import { colors, fonts } from "../tokens"; //

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const familiaNav: NavItem[] = [
  { icon: "🏠", label: "Inicio",      path: "/familia"             },
  { icon: "🎯", label: "Actividades", path: "/familia/actividades" },
  { icon: "👥", label: "Comunidad",   path: "/familia/comunidad"   },
  { icon: "📷", label: "Escanear",    path: "/familia/escanear-qr" },
  { icon: "👤", label: "Perfil",      path: "/familia/perfil"      },
];

export const gestorNav: NavItem[] = [
  { icon: "🏠", label: "Inicio",      path: "/gestor"             },
  { icon: "🎯", label: "Actividades", path: "/gestor/actividades" },
  { icon: "👥", label: "Comunidad",   path: "/gestor/comunidad"   },
  { icon: "📊", label: "Dashboard",   path: "/gestor/dashboard"   },
  { icon: "👤", label: "Perfil",      path: "/gestor/perfil"      },
];

export const BottomNav = ({ items }: { items: NavItem[] }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      background: "white",
      borderTop: `1px solid ${colors.gray200}`,
      padding: "6px 0 10px",
      flexShrink: 0,
      boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
    }}>
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path + item.label}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              color: isActive ? colors.orange : colors.gray500,
              transition: "color 0.2s",
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{
              fontSize: 9,
              fontFamily: fonts.body,
              fontWeight: isActive ? 700 : 400,
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: colors.orange,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};
