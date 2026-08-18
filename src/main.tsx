import "reflect-metadata"; // Required for InversifyJS decorators

import "@core/container/bindings"; // Initialize DI container
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import App from "./App.tsx";

// Sin DSN (dev local) no inicializa nada — evita ruido y warnings en desarrollo.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 0,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
