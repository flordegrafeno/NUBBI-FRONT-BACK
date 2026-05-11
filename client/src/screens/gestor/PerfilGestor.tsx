// PerfilGestor.tsx
// Pantalla de perfil del gestor. Muestra los datos del usuario autenticado
// y permite cerrar sesión.

import { NubbiOwl } from "../../components/NubbiLogo"; // Importación del componente NubbiOwl para mostrar el logo de la aplicación en la pantalla de perfil, lo que proporciona una identidad visual clara y consistente en la aplicación al mostrar el logo de Nubbi en la parte superior de la pantalla de perfil del gestor
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, gestorNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para el gestor, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en gestorNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de gestor de la aplicación desde la parte inferior de la interfaz de usuario, proporcionando una experiencia de usuario fluida y fácil de navegar dentro de la sección de gestor de la aplicación
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes en la pantalla de perfil del gestor
import { useAuth } from "../../providers/AuthProvider";// Importación del hook useAuth para acceder al contexto de autenticación, lo que permite a los componentes de esta pantalla obtener información sobre el usuario autenticado, como su nombre completo y correo electrónico, para mostrar esta información en la pantalla de perfil y proporcionar una experiencia personalizada al usuario al mostrar su información de perfil en la aplicación
import { LogoutButton } from "../../components/LogoutButton";// Importación del componente LogoutButton para mostrar un botón de cierre de sesión en la pantalla de perfil, lo que permite a los usuarios cerrar su sesión de manera fácil y rápida desde la pantalla de perfil, mejorando la experiencia del usuario al proporcionar una opción clara y accesible para cerrar sesión en la aplicación

export const PerfilGestor = () => {
  const { auth } = useAuth();
  const user = auth?.user; // Puede ser undefined si la sesión aún no cargó

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite, paddingBottom: 64 }}>

        {/* Banner de bienvenida */}
        <div style={{
          background: colors.teal,
          padding: "20px 20px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ícono decorativo de fondo, casi transparente para no competir con el contenido */}
          <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.08, fontSize: 120 }}>
            ⚙️
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar circular con el logo de la app como placeholder de foto de perfil */}
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

            {/* Datos del usuario: nombre y email con fallback si no están disponibles */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: fonts.body }}>
                Panel de control
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
                {user?.full_name ?? "Gestor"}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: fonts.body }}>
                {user?.email ?? "email"}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Botón cerrar sesión */}
          <LogoutButton />
        </div>

      </div>
      <BottomNav items={gestorNav} />
    </div>
  );
};