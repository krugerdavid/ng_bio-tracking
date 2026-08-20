import { registerSW } from "virtual:pwa-register";

// El service worker es "best effort" (cacheo offline / instalación como PWA): si el
// registro falla (poco almacenamiento, corte de red, navegador que lo bloquea) no
// debe afectar el uso de la app ni llegar a Sentry como unhandledrejection.
registerSW({
  onRegisterError(error) {
    console.warn("Service worker registration failed", error);
  },
});
