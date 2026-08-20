import "reflect-metadata"; // Required for InversifyJS decorators

import "@core/container/bindings"; // Initialize DI container
import "./index.css";
import "@/pwa/deferredInstall";
import "./registerSW";

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

  // Expuesto para poder probar manualmente desde la consola del navegador:
  // Sentry.captureException(new Error("prueba")) — un error tipeado directo en la
  // consola no siempre dispara el handler global (particularidad del navegador),
  // esto lo evita.
  (window as typeof window & { Sentry: typeof Sentry }).Sentry = Sentry;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
