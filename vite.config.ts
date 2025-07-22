import { defineConfig, loadEnv, type ServerOptions } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import * as path from "node:path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")

  const serverOptions: ServerOptions = {
    port: Number(env.VITE_PORT) || 5173,
    host: env.VITE_HOST || "0.0.0.0",
    proxy: {
      "/api": {
        target: env.VITE_API_URL || "http://localhost:8000",
        secure: false,
        changeOrigin: true
      },
      "/cdn": {
        target: env.VITE_CDN_URL || "http://localhost:8001",
        secure: false,
        changeOrigin: true,
        rewrite: (newPath) => newPath.replace(/^\/cdn/, "")
      },
      "/api/glmiler": {
        target: env.VITE_API_URL_GLMILER || "http://localhost:8002",
        secure: false,
        changeOrigin: true,
        rewrite: (newPath) => newPath.replace(/^\/api\/glmiler/, "")
      }
    }
  }

  return {
    envPrefix: "VITE_",
    server: serverOptions,
    preview: {
      ...serverOptions,
      allowedHosts: ["dev-admin.glmiler.com", "admin.glmiler.com"]
    },

    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true
      }),
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react",
        babel: {
          plugins: [
            [
              "babel-plugin-react-compiler",
              {
                target: "19"
              }
            ]
          ]
        }
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },

    build: {
      minify: "esbuild",
      emptyOutDir: true,
      target: "esnext",
      sourcemap: mode === "development",
      cssCodeSplit: true,
      envPrefix: "VITE_",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          entryFileNames: "src/entry/[name].[hash].bundle.js",
          chunkFileNames: "src/chunks/[name].[hash].bundle.js",
          assetFileNames: "src/assets/[name].[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@here/maps")) {
                return "vendor-maps"
              }

              if (id.includes("moment") || id.includes("date-fns") || id.includes("dayjs")) {
                return "vendor-dates"
              }

              if (id.includes("@tanstack")) {
                return "vendor-tanstack"
              }

              if (id.includes("@radix-ui")) {
                return "vendor-radix"
              }

              return id.toString().split("node_modules/")[1].split("/")[0].toString()
            }
          }
        }
      }
    }
  }
})
