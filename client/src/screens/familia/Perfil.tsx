import { NubbiOwl } from "../../components/NubbiLogo";// Importación del componente NubbiOwl para mostrar el logo de Nubbi en la pantalla de perfil, lo que proporciona una identidad visual clara y consistente en la aplicación al mostrar el logo de Nubbi en la parte superior de la pantalla de perfil, lo que mejora la experiencia del usuario al reforzar la marca y crear una conexión visual con la aplicación
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en familiaNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de familia de la aplicación
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import { useAuth } from "../../providers/AuthProvider";// Importación del hook useAuth para acceder al contexto de autenticación, lo que permite a los componentes de esta pantalla obtener información sobre el usuario autenticado, como su nombre completo y correo electrónico, para mostrar esta información en la pantalla de perfil y proporcionar una experiencia personalizada al usuario al mostrar su información de perfil en la aplicación
import { LogoutButton } from "../../components/LogoutButton";// Importación del componente LogoutButton para mostrar un botón de cierre de sesión en la pantalla de perfil, lo que permite a los usuarios cerrar su sesión de manera fácil y rápida desde la pantalla de perfil, mejorando la experiencia del usuario al proporcionar una opción clara y accesible para cerrar sesión en la aplicación

export const Perfil = () => {// Componente principal de la pantalla de perfil, que muestra una barra superior con el título y una sección de contenido con un banner que incluye el logo de Nubbi y la información del usuario (nombre completo y correo electrónico), y un botón para cerrar sesión, lo que permite a los usuarios ver su información de perfil y cerrar sesión desde esta pantalla dentro de la sección de familia de la aplicación
  const { auth } = useAuth();// Utiliza el hook useAuth para obtener el objeto de autenticación, lo que permite a los componentes de esta pantalla obtener información sobre el usuario autenticado, como su nombre completo y correo electrónico, para mostrar esta información en la pantalla de perfil y proporcionar una experiencia personalizada al usuario al mostrar su información de perfil en la aplicación
  
  const user = auth?.user;// Variable para almacenar la información del usuario autenticado, que se obtiene del objeto de autenticación, lo que permite a los componentes de esta pantalla acceder a esta información para mostrarla en la pantalla de perfil y proporcionar una experiencia personalizada al usuario al mostrar su información de perfil en la aplicación

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{ flex: 1,display:"flex", flexDirection: "column", overflowY: "auto", background: colors.offWhite, paddingBottom: 64,alignItems:"center" }}>

        {/* Banner */}
        <div style={{
          background: colors.orange,
          padding: "40px 40px 40px",
          position: "relative",
          overflow: "hidden",
          width:"100%"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid rgba(255,255,255,0.6)",
            }}>
              <NubbiOwl size={44} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: fonts.body }}>
                ¡Bienvenido de nuevo!
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "white", fontFamily: fonts.body }}>
                {user?.full_name ?? "Usuario"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: fonts.body }}>
                {user?.email}
              </div>
            </div>
          </div>

          
        </div>

        {/* Acciones */}
        <LogoutButton/>

      </div>
      <BottomNav items={familiaNav} />
    </div>
  );
};
