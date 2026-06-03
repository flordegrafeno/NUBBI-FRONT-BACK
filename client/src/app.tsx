import { Routes, Route, Navigate } from "react-router-dom"; // Importación de componentes de React Router para definir las rutas de la aplicación, lo que permite a los componentes de esta pantalla redirigir a los usuarios a otras pantallas de la aplicación según las interacciones del usuario y controlar el acceso a ciertas rutas según el estado de autenticación del usuario
import type { JSX } from "preact";// Importación del tipo JSX para definir los tipos de los componentes, lo que permite a los desarrolladores tener una mejor experiencia de desarrollo al proporcionar autocompletado y verificación de tipos en los componentes de la aplicación

import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { RoleSelector }          from "./screens/RoleSelector";
import { LoginScreen }           from "./screens/Login";
import { HomeFamiliaScreen }     from "./screens/familia/HomeFamilia";
import { ActividadesScreen }     from "./screens/familia/Actividades";
import { ComunidadScreen }       from "./screens/familia/Comunidad";
import { EscanearQRScreen }      from "./screens/familia/EscanearQR";
import { Perfil }                from "./screens/familia/Perfil";
import { HomeGestorScreen }      from "./screens/gestor/HomeGestor";
import { CrearActividadScreen }  from "./screens/gestor/CrearActividad";
import { DashboardScreen }       from "./screens/gestor/Dashboard";
import { PerfilGestor }          from "./screens/gestor/PerfilGestor";
import { ComunidadGestorScreen } from "./screens/gestor/ComunidadGestor";
import type { UserRole } from "./types";
import { ChatScreen } from "./screens/chat/ChatScreen";
import { AsistenciaQRScreen } from "./screens/AsistenciaQR";

const PrivateRoute = ({ children, role }: { children: JSX.Element; role?: UserRole }) => {
  const { auth, isLoading } = useAuth();
  if (isLoading) return null;
  if (!auth) return <Navigate to="/" replace />;
  if (role && auth.user.role !== role) return <Navigate to={`/${auth.user.role}`} replace />;
  return children;
};
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { auth, isLoading } = useAuth();
  if (isLoading) return null;
  if (auth) {
    // Si viene de un QR, redirigir de vuelta a esa URL tras autenticarse
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) return <Navigate to={redirect} replace />;
    return <Navigate to={`/${auth.user.role}`} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%" }}>
    <Routes>
      <Route path="/"      element={<PublicRoute><RoleSelector /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
      <Route path="/familia"             element={<PrivateRoute role="familia"><HomeFamiliaScreen /></PrivateRoute>} />
      <Route path="/familia/actividades" element={<PrivateRoute role="familia"><ActividadesScreen /></PrivateRoute>} />
      <Route path="/familia/comunidad"   element={<PrivateRoute role="familia"><ComunidadScreen /></PrivateRoute>} />
      <Route path="/familia/escanear-qr" element={<PrivateRoute role="familia"><EscanearQRScreen /></PrivateRoute>} />
      <Route path="/familia/perfil"      element={<PrivateRoute role="familia"><Perfil /></PrivateRoute>} />
      <Route path="/familia/comunidad/:roomId" element={<PrivateRoute role="familia"><ChatScreen /></PrivateRoute>} />
      <Route path="/gestor/comunidad/:roomId" element={<PrivateRoute role="gestor"><ChatScreen /></PrivateRoute>} />
      <Route path="/gestor"              element={<PrivateRoute role="gestor"><HomeGestorScreen /></PrivateRoute>} />
      <Route path="/gestor/actividades"  element={<PrivateRoute role="gestor"><CrearActividadScreen /></PrivateRoute>} />
      <Route path="/gestor/comunidad"    element={<PrivateRoute role="gestor"><ComunidadGestorScreen /></PrivateRoute>} />
      <Route path="/gestor/dashboard"    element={<PrivateRoute role="gestor"><DashboardScreen /></PrivateRoute>} />
      <Route path="/gestor/perfil"       element={<PrivateRoute role="gestor"><PerfilGestor /></PrivateRoute>} />

      <Route path="/asistencia" element={<AsistenciaQRScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export const App = () => (
  <AuthProvider>
    <AppRoutes/>
  </AuthProvider>
);