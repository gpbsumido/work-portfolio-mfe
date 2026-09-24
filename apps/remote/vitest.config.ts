import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import pkg from "./package.json" with { type: "json" };

// Two projects:
//   unit - everything under src/, run on every push
//   dist - checks against the built output (CSS scope, catalog.json), so it
//          only makes sense after `pnpm build`; CI runs it right after.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  define: { __REMOTE_VERSION__: JSON.stringify(pkg.version) },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dist",
          environment: "node",
          include: ["dist-checks/**/*.test.ts"],
        },
      },
    ],
  },
});
