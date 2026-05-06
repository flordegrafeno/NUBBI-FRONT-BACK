// ─── PANTALLA SELECTOR DE ROL ─────────────────────────────────────────────────
// Primera pantalla que ve el usuario. Elige si es Familia o Gestor.
// Va en screens/ porque no pertenece ni a familia ni a gestor.

import { colors, fonts } from "../tokens";
import { NubbiOwl, NubbiOwlGestor } from "../components/NubbiLogo";
import type { UserRole } from "../types";

export const RoleSelector = ({
  onSelect,
}: {
  onSelect: (rol: UserRole) => void;
}) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${colors.orangeVeryLight} 0%, ${colors.tealLight} 100%)`,
    fontFamily: fonts.body,
    padding: 40,
  }}>

    {/* Mascota grande en la entrada */}
    <NubbiOwl size={110} />

    <h1 style={{
      fontFamily: fonts.display,
      fontSize: 44,
      color: colors.orange,
      margin: "12px 0 4px",
      letterSpacing: "-1px",
    }}>
      NÜBBI
    </h1>

    <p style={{
      color: colors.textLight,
      fontSize: 14,
      marginBottom: 40,
      textAlign: "center",
      fontFamily: fonts.body,
    }}>
      Selecciona tu perfil para continuar
    </p>

    {/* Botones de selección de rol */}
    <div style={{ display: "flex", gap: 20 }}>
      {[
        {
          rol:     "familia" as UserRole,
          label:   "Miembro de Familia",
          color:   colors.orange,
          bg:      colors.orangeVeryLight,
          mascota: <NubbiOwl size={60} />,
        },
        {
          rol:     "gestor" as UserRole,
          label:   "Miembro Gestor",
          color:   colors.teal,
          bg:      colors.tealLight,
          mascota: <NubbiOwlGestor size={60} />,
        },
      ].map((opcion) => (
        <button
          key={opcion.rol}
          onClick={() => onSelect(opcion.rol)}
          style={{
            background: "white",
            border: `3px solid ${opcion.color}`,
            borderRadius: 20,
            padding: "24px 20px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            boxShadow: `0 8px 24px ${opcion.color}30`,
            width: 148,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
            (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 36px ${opcion.color}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${opcion.color}30`;
          }}
        >
          {/* Círculo con la mascota */}
          <div style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: opcion.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {opcion.mascota}
          </div>

          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: opcion.color,
            textAlign: "center",
            fontFamily: fonts.body,
          }}>
            {opcion.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);