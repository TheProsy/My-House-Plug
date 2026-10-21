import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    pool: "threads",
    environment: "node",
    testTimeout: 20_000,
    hookTimeout: 20_000,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
