/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // Solo precachea el shell (JS/CSS/HTML/íconos) — nunca respuestas de la API,
      // que son datos de pagos/bioimpedancia y deben salir siempre de red.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
      },
      includeAssets: ["apple-touch-icon.png", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "NG Training",
        short_name: "NG Training",
        description: "Bio Tracker - NG Training Application",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  build: {
    chunkSizeWarningLimit: 2000,
    sourcemap: process.env.NODE_ENV === "development" ? true : "hidden",
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor dependencies
          vendor: ["react", "react-dom", "react-router-dom"],
          inversify: ["inversify", "reflect-metadata"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },

  // @ts-expect-error - Vitest config in Vite config
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
