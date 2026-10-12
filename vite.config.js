import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/pointer/" : "/",
  plugins: [solid()],
  server: {
    host: true,
    allowedHosts: [".trycloudflare.com"],
  },
}));
