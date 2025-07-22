import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { AuthorizationProvider } from "./contexts/AuthorizationContext.jsx";
import "./index.css";
// Import file CSS toàn cục cho buttons
import "./styles/global-buttons.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthorizationProvider>
          <App />
        </AuthorizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);