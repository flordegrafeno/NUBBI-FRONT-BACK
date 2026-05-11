// HomeGestorScreen.tsx
// Pantalla de inicio del gestor. Muestra un menú de acciones rápidas
// que redirigen a las secciones principales de la aplicación.

import { useNavigate } from "react-router-dom"; // Importación del hook useNavigate para programáticamente navegar entre rutas, lo que permite a los componentes de esta pantalla redirigir a los usuarios a otras pantallas de la aplicación según las interacciones del usuario, como hacer clic en un botón para ir a la sección de actividades, comunidad, dashboard o perfil dentro de la sección de gestor de la aplicación
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, gestorNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para el gestor, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en gestorNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de gestor de la aplicación


export const HomeGestorScreen = () => {// Componente principal de la pantalla de inicio del gestor, que muestra una barra superior con el título y una sección de contenido con un menú principal que incluye tarjetas para acceder a las diferentes funcionalidades de la sección de gestor (crear actividades, comunidad, dashboard y perfil), lo que permite a los usuarios navegar fácilmente a estas funcionalidades desde la pantalla de inicio de la sección de gestor de la aplicación
  const navigate = useNavigate();// Utiliza el hook useNavigate para obtener la función de navegación, lo que permite a los componentes de esta pantalla redirigir a los usuarios a otras pantallas de la aplicación según las interacciones del usuario, como hacer clic en un botón para ir a la sección de actividades, comunidad, dashboard o perfil dentro de la sección de gestor de la aplicación

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar />
      <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite, paddingBottom: 64 }}>

        {/* Menú de acciones */}
        <div style={{ padding: "16px 16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 12, fontFamily: fonts.body }}>
            Acciones rápidas
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Cada item define su ícono, textos, colores y ruta de navegación */}
            {[
              {
                icon: "🎯",
                label: "Crear Actividades",
                subtitle: "Comparte nuevas experiencias para que las familias participen y mantengan informadas el tema de las actividades.",
                color:   colors.pink,
                bgColor: colors.pinkLight,
                path:    "/gestor/actividades",
              },
              {
                icon: "👥",
                label: "Comunidad",
                subtitle: "Conversa, motiva y responde directamente a las dudas de los hogares.",
                color:   colors.blue,
                bgColor: colors.blueLight,
                path:    "/gestor",
              },
              {
                icon: "📊",
                label: "Dashboard",
                subtitle: "Analiza el compromiso de las familias y el impacto de tus actividades.",
                color:   colors.orange,
                bgColor: colors.orangeVeryLight,
                path:    "/gestor/dashboard",
              },
              {
                icon: "👤",
                label: "Perfil",
                subtitle: "",
                color:   colors.teal,
                bgColor: colors.tealLight,
                path:    "/gestor",
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: item.bgColor,
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  width: "100%",
                  transition: "transform 0.15s",
                }}
                // Efecto hover: eleva levemente la tarjeta al pasar el cursor
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {/* Ícono con fondo sólido en el color primario de la acción */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0, // Evita que el ícono se comprima si el texto es largo
                }}>
                  {item.icon}
                </div>

                {/* Textos: título de la acción y descripción corta */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: colors.text, fontFamily: fonts.body }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.4, marginTop: 2, fontFamily: fonts.body }}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
      <BottomNav items={gestorNav} />
    </div>
  );
};