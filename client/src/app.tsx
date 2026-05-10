import { Routes, Route, Navigate } from "react-router-dom";

import { RoleSelector }         from "./screens/RoleSelector";
import { HomeFamiliaScreen }    from "./screens/familia/HomeFamilia";
import { ActividadesScreen }    from "./screens/familia/Actividades";
import { ComunidadScreen }      from "./screens/familia/Comunidad";
import { EscanearQRScreen }     from "./screens/familia/EscanearQR";
import { Perfil }               from "./screens/familia/Perfil";
import { HomeGestorScreen }     from "./screens/gestor/HomeGestor";
import { CrearActividadScreen } from "./screens/gestor/CrearActividad";
import { DashboardScreen }      from "./screens/gestor/Dashboard";

export const App = () => (
  <div class="flex min-h-100vh">
    <Routes>
      <Route path="/"                    element={<RoleSelector />}         />
      
      <Route path="/familia"             element={<HomeFamiliaScreen />}    />
      <Route path="/familia/actividades" element={<ActividadesScreen />}    />
      <Route path="/familia/comunidad"   element={<ComunidadScreen />}      />
      <Route path="/familia/escanear-qr" element={<EscanearQRScreen />}    />
      <Route path="/familia/perfil"      element={<Perfil />}               />

      <Route path="/gestor"              element={<HomeGestorScreen />}     />
      <Route path="/gestor/actividades"  element={<CrearActividadScreen />} />
      <Route path="/gestor/dashboard"    element={<DashboardScreen />}      />
      <Route path="*"                    element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);
