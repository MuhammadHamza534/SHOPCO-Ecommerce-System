import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "./",

  build: {
    outDir: "../docs/11th-Assignment",
    emptyOutDir: true,
  },
});