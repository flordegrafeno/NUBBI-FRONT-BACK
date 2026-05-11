import { useNavigate } from "react-router-dom";// Importación del hook useNavigate para programáticamente navegar entre rutas, lo que permite a los componentes de esta pantalla redirigir a los usuarios a otras pantallas de la aplicación según las interacciones del usuario, como hacer clic en un botón para ir a la sección de actividades, comunidad, escanear QR o perfil dentro de la sección de familia de la aplicación
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import {  TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en familiaNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de familia de la aplicación


const MenuCard = ({// Componente para mostrar una tarjeta de menú en la pantalla de inicio de la sección de familia, que incluye un ícono, un título, una descripción y estilos personalizados para cada tarjeta, y que permite a los usuarios hacer clic en la tarjeta para navegar a la pantalla correspondiente dentro de la sección de familia de la aplicación
  icon,
  label,
  subtitle,
  color,
  bgColor,
  onClick,
}: {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: bgColor,
      border: "none",
      borderRadius: 16,
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 6,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      textAlign: "left",
      width: "100%",
      height: "30vh",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={(e) => {// Al hacer hover sobre la tarjeta, se aplica una transformación para elevar la tarjeta y se agrega una sombra más pronunciada, lo que proporciona una retroalimentación visual clara al usuario de que la tarjeta es interactiva y mejora la experiencia del usuario al hacer que la interfaz sea más dinámica y atractiva
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
    }}
  >
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    }}>
      {icon}
    </div>
    <div style={{ fontWeight: 700, fontSize: 20, color: colors.text, fontFamily: fonts.body }}>
      {label}
    </div>
    <div style={{ fontSize: 10, color: colors.textLight, lineHeight: 1.3, fontFamily: fonts.body }}>
      {subtitle}
    </div>
  </button>
);

export const HomeFamiliaScreen = () => {// Componente principal de la pantalla de inicio de la sección de familia, que muestra una barra superior con el título y una sección de contenido con un menú principal que incluye tarjetas para acceder a las diferentes funcionalidades de la sección de familia (actividades, comunidad, escanear QR y perfil), lo que permite a los usuarios navegar fácilmente a estas funcionalidades desde la pantalla de inicio de la sección de familia de la aplicación
  const navigate = useNavigate();// Utiliza el hook useNavigate para obtener la función de navegación, lo que permite a los componentes de esta pantalla redirigir a los usuarios a otras pantallas de la aplicación según las interacciones del usuario, como hacer clic en un botón para ir a la sección de actividades, comunidad, escanear QR o perfil dentro de la sección de familia de la aplicación

  return (
    <div className="HomeFamilia" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height:"100vh" }}>
      <TopBar />
      <div style={{ flex: 1, overflowY: "auto", background: colors.offWhite, paddingBottom: 64 }}>

        {/* Grid del menú principal */}
        <div style={{ padding: "4vh 2vh 7vh" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 12, fontFamily: fonts.body }}>
            ¿Qué quieres hacer hoy?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MenuCard
              icon="🎯"
              label="Actividades"
              subtitle="Elige desafíos para tu familia"
              color={colors.pink}
              bgColor={colors.pinkLight}
              onClick={() => navigate("/familia/actividades")}
            />
            
            <MenuCard
              icon="👥"
              label="Comunidad"
              subtitle="Conecta con otras familias"
              color={colors.blue}
              bgColor={colors.blueLight}
              onClick={() => navigate("/familia/comunidad")}
            />
            <MenuCard
              icon="📷"
              label="Escanear QR"
              subtitle="Registra asistencia y aprende"
              color={colors.teal}
              bgColor={colors.tealLight}
              onClick={() => navigate("/familia/escanear-qr")}
            />
            <MenuCard
              icon="👤"
              label="Perfil"
              subtitle=""
              color={colors.cream}
              bgColor={colors.creamLight}
              onClick={() => navigate("/familia/perfil")}
            />
          </div>
        </div>

        

      </div>
      <BottomNav items={familiaNav} />
    </div>
  );
};
