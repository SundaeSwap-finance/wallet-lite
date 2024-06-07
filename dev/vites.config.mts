import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import inject from "@rollup/plugin-inject";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import config from "../../config/local.json";

export default defineConfig({
  define: {
    global: "globalThis",
    appConfig: config,
  },
  plugins: [
    inject({
      modules: {
        process: "process",
        Buffer: ["buffer", "Buffer"],
      },
      global: "globalThis",
      sourceMap: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
      Buffer: "buffer",
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    sourcemap: "inline",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
