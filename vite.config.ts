/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

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
