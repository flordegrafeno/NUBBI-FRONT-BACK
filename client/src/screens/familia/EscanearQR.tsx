import { useState } from "preact/hooks"; // Cambiado a Preact para mantener la consistencia con el resto de la aplicación, lo que permite utilizar los hooks de estado y otros hooks de Preact para manejar el estado y el ciclo de vida del componente de manera eficiente y con una sintaxis similar a React, pero optimizada para aplicaciones más ligeras como esta
import { colors, fonts } from "../../tokens";// Importación de tokens de diseño para colores y fuentes, lo que permite mantener la consistencia visual en la aplicación al usar estos tokens para definir los estilos de los componentes
import { TopBar } from "../../components/PhoneFrame";// Importación del componente TopBar para mostrar la barra superior de la pantalla, lo que proporciona una estructura visual clara y consistente en la aplicación al mostrar el título de la pantalla y otros elementos de navegación o información relevante en la parte superior de la interfaz de usuario
import { BottomNav, familiaNav } from "../../components/BottomNav";// Importación del componente BottomNav y la configuración de navegación para la familia, lo que proporciona una barra de navegación inferior con las opciones de navegación definidas en familiaNav, lo que permite a los usuarios navegar fácilmente entre las diferentes pantallas de la sección de familia de la aplicación
import { useScanQR } from "../../providers/AsistenciasProvider";// Importación del hook personalizado useScanQR para manejar la lógica de escanear códigos QR, lo que permite a los componentes que usan este hook acceder a la función de escaneo, el estado de carga, el error y el resultado del escaneo para mostrar la interfaz correspondiente según el estado del proceso de escaneo y para realizar la acción de escanear un código QR al registrar la asistencia en una actividad

export const EscanearQRScreen = () => {// Componente principal de la pantalla de escanear código QR, que muestra una barra superior con el título y una sección de contenido con un visor decorativo para simular la experiencia de escanear un código QR, un formulario para ingresar el código QR manualmente (simulando el escaneo) y mostrar mensajes de éxito o error según el resultado del proceso de escaneo, lo que permite a los usuarios registrar su asistencia a una actividad ingresando el código QR proporcionado por la actividad, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario
  const [payload, setPayload] = useState("");// Estado para almacenar el valor del código QR ingresado manualmente, lo que permite a los usuarios ingresar el código QR proporcionado por la actividad para registrar su asistencia, y se actualiza a medida que el usuario escribe en el campo de entrada, lo que permite mostrar el valor actual del código QR en la interfaz de usuario y usarlo para realizar la acción de escanear al enviar el formulario
  const { scan, loading, error, resultado } = useScanQR();// Utiliza el hook useScanQR para obtener la función de escaneo, el estado de carga, el error y el resultado del escaneo, lo que permite a los componentes que usan este hook acceder a esta información para mostrar la interfaz correspondiente según el estado del proceso de escaneo y para realizar la acción de escanear un código QR al registrar la asistencia en una actividad

  const handleScan = async (e: Event) => {// Función para manejar el envío del formulario de escaneo, que previene el comportamiento por defecto del formulario, verifica que el payload no esté vacío y luego llama a la función de escaneo con el payload ingresado, lo que permite a los usuarios registrar su asistencia a una actividad ingresando el código QR proporcionado por la actividad, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario
    e.preventDefault();// Previene el comportamiento por defecto del formulario, lo que evita que la página se recargue al enviar el formulario, permitiendo manejar el proceso de escaneo de manera asíncrona y mostrar mensajes de éxito o error sin interrumpir la experiencia del usuario
    if (!payload.trim()) return;// Verifica que el payload no esté vacío después de eliminar los espacios en blanco, lo que evita intentar escanear un código QR vacío y permite mostrar un mensaje de error o simplemente no hacer nada si el usuario intenta enviar el formulario sin ingresar un código QR, mejorando la experiencia del usuario al proporcionar retroalimentación clara sobre lo que se espera en el campo de entrada
    try {// Intenta llamar a la función de escaneo con el payload ingresado, lo que permite a los usuarios registrar su asistencia a una actividad ingresando el código QR proporcionado por la actividad, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario al mostrar mensajes de éxito o error según el resultado del proceso de escaneo
      await scan(payload.trim());// Llama a la función de escaneo con el payload ingresado después de eliminar los espacios en blanco, lo que permite a los usuarios registrar su asistencia a una actividad ingresando el código QR proporcionado por la actividad, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario al mostrar mensajes de éxito o error según el resultado del proceso de escaneo
      setPayload("");// Limpia el campo de entrada después de intentar escanear, lo que proporciona una mejor experiencia de usuario al permitir que el usuario ingrese un nuevo código QR sin tener que eliminar manualmente el valor anterior, y también ayuda a prevenir errores al intentar escanear el mismo código QR varias veces sin querer
    } catch {// Si ocurre un error durante el proceso de escaneo, no se hace nada aquí porque el estado de error ya está manejado dentro del hook useScanQR, lo que permite mostrar un mensaje de error en la interfaz de usuario sin necesidad de manejarlo explícitamente en esta función, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario al mostrar mensajes de éxito o error según el resultado del proceso de escaneo
      // error ya está en el estado del hook
    }
  };

  return (// El componente devuelve una estructura de divs que conforman la pantalla de escanear código QR, con estilos definidos para cada sección para lograr una apariencia visual clara y consistente, y con componentes como TopBar para proporcionar una experiencia de usuario fluida y fácil de navegar dentro de la sección de familia de la aplicación, y con un formulario para ingresar el código QR manualmente (simulando el escaneo) y mostrar mensajes de éxito o error según el resultado del proceso de escaneo, lo que permite a los usuarios registrar su asistencia a una actividad ingresando el código QR proporcionado por la actividad, y proporciona retroalimentación clara sobre el estado del proceso de escaneo para mejorar la experiencia del usuario
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100vh" }}>
      <TopBar />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: colors.offWhite,
        padding: 20,
        paddingBottom: 64,
        overflowY: "auto",
      }}>

        <div style={{ fontSize: 17, fontWeight: 800, color: colors.text, marginBottom: 6, fontFamily: fonts.body }}>
          Escanear código QR
        </div>
        <div style={{ fontSize: 11, color: colors.textLight, textAlign: "center", marginBottom: 24, fontFamily: fonts.body }}>
          Ingresa el código QR de la actividad para registrar tu asistencia.
        </div>

        {/* Visor decorativo */}
        <div style={{
          width: 220, height: 220, position: "relative", borderRadius: 20,
          overflow: "hidden", background: "#1a1a2e", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ position: "absolute", width: 100, height: 100, border: `3px solid ${colors.teal}`, borderRadius: 8, opacity: 0.5 }} />
          </div>
          {[
            { top: 10, left: 10,   borderTop: true,    borderLeft: true  },
            { top: 10, right: 10,  borderTop: true,    borderRight: true },
            { bottom: 10, left: 10,  borderBottom: true, borderLeft: true  },
            { bottom: 10, right: 10, borderBottom: true, borderRight: true },
          ].map((corner, i) => (
            <div key={i} style={{
              position: "absolute", width: 20, height: 20,
              top: corner.top, left: corner.left, right: corner.right, bottom: corner.bottom,
              borderColor: colors.teal, borderStyle: "solid",
              borderTopWidth: corner.borderTop ? 3 : 0, borderLeftWidth: corner.borderLeft ? 3 : 0,
              borderRightWidth: corner.borderRight ? 3 : 0, borderBottomWidth: corner.borderBottom ? 3 : 0,
              borderRadius: 3,
            }} />
          ))}
          <div style={{
            position: "absolute", left: 10, right: 10, height: 2, top: "50%",
            background: `linear-gradient(90deg, transparent, ${colors.teal}, transparent)`,
            boxShadow: `0 0 8px ${colors.teal}`,
          }} />
        </div>

        {resultado && (
          <div style={{
            marginTop: 20, width: "100%", background: colors.greenLight, borderRadius: 12,
            padding: "14px 16px", textAlign: "center", border: `1px solid ${colors.green}40`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: colors.green, fontFamily: fonts.body }}>
              ¡Asistencia registrada!
            </div>
            <div style={{ fontSize: 12, color: colors.textLight, fontFamily: fonts.body, marginTop: 4 }}>
              Asistencia registrada con éxito
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 20, width: "100%", background: "#FFF0F3", borderRadius: 12,
            padding: "12px 16px", textAlign: "center", border: `1px solid ${colors.pinkDark}30`,
          }}>
            <div style={{ fontSize: 12, color: colors.pinkDark, fontFamily: fonts.body }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleScan} style={{ marginTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Pega aquí el código QR"
            type="text"
            value={payload}
            onInput={(e) => setPayload((e.target as HTMLInputElement).value)}
            style={{
              width: "100%", background: "white", borderRadius: 12,
              padding: "10px 14px", border: `1px solid ${colors.gray200}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: 13,
              fontFamily: fonts.body, color: colors.text, outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={loading || !payload.trim()}
            style={{
              padding: "12px 0",
              background: loading || !payload.trim() ? colors.gray300 : colors.teal,
              border: "none", borderRadius: 12, color: "white", fontWeight: 700,
              fontSize: 13, cursor: loading || !payload.trim() ? "not-allowed" : "pointer",
              fontFamily: fonts.body, transition: "background 0.2s",
            }}
          >
            {loading ? "Registrando..." : "Registrar asistencia"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: colors.textLight, fontFamily: fonts.body }}>
            El gestor del evento te dará el código QR de la actividad.
          </div>
        </div>
      </div>
      <BottomNav items={familiaNav} />
    </div>
  );
};
