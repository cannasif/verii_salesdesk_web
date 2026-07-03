import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const allowedHosts = ["https://salesdesk.v3rii.com"]

function resolveDevApiProxyTarget(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "")
  const fromEnv = env.VITE_API_URL?.trim() || env.VITE_DEV_API_PROXY_TARGET?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }

  try {
    const runtimePath = path.resolve(__dirname, "public/runtime-settings.json")
    const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8")) as { apiUrl?: string }
    if (runtime.apiUrl?.trim()) {
      return runtime.apiUrl.trim().replace(/\/$/, "")
    }
  } catch {
    // runtime-settings.json is optional during local setup
  }

  return "https://salesdeskapi.v3rii.com"
}

function resolveDevLocalServerTarget(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "")
  const fromEnv = env.VITE_CHAT_SERVER_URL?.trim() || env.VITE_GMAIL_BRIDGE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  return "http://localhost:8787"
}

export default defineConfig(({ mode }) => {
  const devApiProxyTarget = resolveDevApiProxyTarget(mode)
  const devLocalServerTarget = resolveDevLocalServerTarget(mode)

  return {
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsDir: "public/assets",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        const isSignalrPureAnnotationWarning =
          warning.code === "INVALID_ANNOTATION" &&
          typeof warning.id === "string" &&
          warning.id.includes("@microsoft/signalr") &&
          warning.message.includes("/*#__PURE__*/")

        if (isSignalrPureAnnotationWarning) return

        defaultHandler(warning)
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("powerbi-client")) return "vendor-powerbi"
          if (id.includes("@tiptap")) return "vendor-tiptap"
          if (id.includes("xlsx")) return "vendor-xlsx"
          if (id.includes("pptxgenjs") || id.includes("jspdf")) return "vendor-doc-export"
          if (id.includes("three") || id.includes("@react-three")) return "vendor-three"
          if (id.includes("recharts")) return "vendor-recharts"
          if (id.includes("html2canvas")) return "vendor-html2canvas"
        },
      },
    },
  },
  server: {
    allowedHosts,
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      "/api": {
        target: devApiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      "/notificationHub": {
        target: devApiProxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // /salesdesk/groups React sayfasi ile cakisir; grup API'si /groups uzerinden proxy'lenir.
      "/groups": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
      },
      "/erp-news-meta": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
      },
      "/erp-news-meta-triggers": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
      },
      "/gmail": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: devLocalServerTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  }
})
