import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import config from "../config/local.json";

export default defineConfig({
  define: {
    appConfig: config,
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
      },
      include: ["stream", "vm", "process", "crypto", "util"],
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    sourcemap: process.env.NODE_ENV === "production" ? undefined : "inline",
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
