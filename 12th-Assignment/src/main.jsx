import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AdminAuthProvider } from "./context/AdminAuth";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AdminAuthProvider><App /></AdminAuthProvider>
    </HashRouter>
  </StrictMode>
);
