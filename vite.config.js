import { defineConfig } from "vite";
import { pwa } from "./scripts/pwa.js";
export default defineConfig({ plugins: [pwa()] });
