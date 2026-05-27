import { render } from "preact";
import "./index.css";
import { App } from "./app.tsx";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./providers/ToastProvider";
import { AxiosProvider } from "./providers/AxiosProvider";
import { SocketProvider } from "./providers/SocketProvider"; // NUEVO

render(
  <ToastProvider>
    <AxiosProvider>
      {/* SocketProvider va dentro de AxiosProvider (necesita el token)
          pero fuera de BrowserRouter no importa el orden aquí */}
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </AxiosProvider>
  </ToastProvider>,
  document.getElementById("app")!
);