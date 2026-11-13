import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ASSET_VERSION } from "./src/assetVersion";

// Writes the current ASSET_VERSION into index.html (%ASSET_VERSION%), so the
// preloaded model URL always matches the one the code requests. Only bump
// ASSET_VERSION in src/assetVersion.ts after replacing a model/texture.
const assetVersionInHtml = (): Plugin => ({
  name: "asset-version-in-html",
  transformIndexHtml: {
    order: "pre", // before Vite parses the HTML
    handler: (html) => html.replaceAll("%ASSET_VERSION%", ASSET_VERSION),
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), assetVersionInHtml()],
});
