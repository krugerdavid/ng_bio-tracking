import "reflect-metadata"; // Required for InversifyJS decorators

import "@core/container/bindings"; // Initialize DI container
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
