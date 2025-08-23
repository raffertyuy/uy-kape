import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@/test-utils": fileURLToPath(
        new URL("./tests/config/test-utils.tsx", import.meta.url),
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          router: ["react-router-dom"],
        },
        // Optimize asset file naming for better caching
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.includes("logo")) {
            return "assets/logos/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    // Enable asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable sourcemaps for production debugging (optional)
    sourcemap: false,
    // Optimize build size
    minify: "esbuild",
    target: "es2020",
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better UX
    },
  },
  // Enable asset preloading hints
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (filename.includes("logo") && hostType === "html") {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        };
      }
      return { relative: true };
    },
  },
});
