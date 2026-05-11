import { useState } from "preact/hooks"; // Cambiado a Preact

import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes  
import {  TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en familiaNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de familia de la aplicación

const contactos = [// Lista de contactos para mostrar en la pestaña de contactos, que incluye el nombre del contacto, un mensaje de ejemplo, la hora del último mensaje, un avatar representado por un emoji y el número de mensajes no leídos, lo que permite mostrar esta información en la interfaz de usuario para que el usuario pueda ver sus contactos cercanos y la actividad reciente con cada uno de ellos
  { name: "Gestor Santamaria", msg: "Hola, te esperamos en la experiencia esta...", time: "10:24", avatar: "👩‍💼", unread: 2 },
  { name: "Papá",              msg: "Hola hijo ¿cómo estás?",                      time: "09:15", avatar: "👨",   unread: 0 },
];

const chats = [
  { name: "Grupo Mi Hogar Avanza", msg: "Muchas gracias por la iniciativa de...", time: "10:30", avatar: "🏠", unread: 5 },
  { name: "Mamá",                  msg: "Ok amor, hasta luego",                   time: "08:45", avatar: "👩", unread: 0 },
];

export const ComunidadScreen = () => {// Componente principal de la pantalla de comunidad, que muestra una barra superior con el título y una sección de contenido con un header que incluye un gradiente y tabs para cambiar entre la vista de chats y contactos, y una lista de conversaciones o contactos según la pestaña seleccionada, lo que permite a los usuarios interactuar con sus contactos y chats grupales dentro de la comunidad de Nubbi

  const [tab, setTab] = useState<"chats" | "contactos">("chats");// Estado para controlar la pestaña seleccionada, que puede ser "chats" o "contactos", y se inicializa en "chats" para mostrar la lista de chats por defecto, lo que permite a los usuarios cambiar entre la vista de chats y contactos según su preferencia al hacer clic en las pestañas correspondientes

  const items = tab === "contactos" ? contactos : chats;// Variable para almacenar la lista de elementos a mostrar en la sección principal, que se determina según la pestaña seleccionada (si la pestaña es "contactos", se muestran los contactos, de lo contrario se muestran los chats), lo que permite mostrar la información relevante en la interfaz de usuario según la selección del usuario entre chats y contactos

  return (// El componente devuelve una estructura de divs que conforman la pantalla de comunidad, con estilos definidos para cada sección para lograr una apariencia visual clara y consistente, y con componentes como TopBar y BottomNav para proporcionar una experiencia de usuario fluida y fácil de navegar dentro de la sección de comunidad de la aplicación
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height:"100vh" }}>
      <TopBar  />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height:"100vh" }}>

        {/* Header con gradiente y tabs */}
        <div style={{
          background: ` ${colors.blue}`,
          padding: "16px 20px",
          color: "white",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fonts.body }}>
            Comunidad Nubbi
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontFamily: fonts.body }}>
            Conversa con tus contactos y crea un chat grupal con tu familia.
          </div>

          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: 3,
            marginTop: 12,
            gap: 2,
          }}>
            {(["chats", "contactos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 16,
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? colors.blue : "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  fontFamily: fonts.body,
                  transition: "all 0.2s",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "10px 16px 4px", background: colors.gray100, flexShrink: 0 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: colors.textLight,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: fonts.body,
          }}>
            {tab === "contactos" ? "Cerca de ti" : "Mis chats"}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div style={{ flex: 1, overflowY: "auto", background: "white", position: "relative", paddingBottom: 64 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: `1px solid ${colors.gray100}`,
              cursor: "pointer",
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: ` ${colors.blueLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}>
                {item.avatar}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: colors.text, fontFamily: fonts.body }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
                    {item.time}
                  </span>
                </div>
                <div style={{
                  fontSize: 11,
                  color: colors.textLight,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: fonts.body,
                }}>
                  {item.msg}
                </div>
              </div>

              {item.unread > 0 && (
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: colors.orange,
                  color: "white",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: fonts.body,
                }}>
                  {item.unread}
                </div>
              )}
            </div>
          ))}

          {/* Botón flotante nuevo chat */}
          <button style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: colors.orange,
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "white",
            boxShadow: `0 4px 14px ${colors.orange}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            +
          </button>
        </div>

      </div>
      <BottomNav items={familiaNav} />
    </div>
  );
};
