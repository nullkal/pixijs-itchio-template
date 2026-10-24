import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // itch.io serves each uploaded game from its own subdirectory.
  base: "./",
  server: {
    port: 8080,
    open: true,
  },
});
