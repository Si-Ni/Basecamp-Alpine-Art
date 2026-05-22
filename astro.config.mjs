import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  adapter: cloudflare(),
  site: "https://www.basecamp-alpine-art.de",
});
