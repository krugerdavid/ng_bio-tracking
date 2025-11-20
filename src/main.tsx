import "reflect-metadata"; // Required for InversifyJS decorators
import "@core/container/bindings"; // Initialize DI container
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@presentation/app/providers/AuthProvider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
