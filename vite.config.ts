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
        // Assign chunks by package path so shared deps (react, react-dom) stay in
        // `vendor` instead of being pulled into `router` by react-router v7
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return "vendor";
          }
          if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return "supabase";
          if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id)) return "router";
          return undefined;
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
