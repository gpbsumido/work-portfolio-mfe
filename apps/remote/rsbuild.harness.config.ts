import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

// The CI stand-in host (harness/index.tsx). Built and served separately from
// the remote, on its own port, so the remote is genuinely cross-origin to it.
export default defineConfig({
  plugins: [pluginReact()],
  source: { entry: { index: "./harness/index.tsx" } },
  output: { distPath: { root: "harness-dist" } },
  html: { title: "Work portfolio host harness" },
  server: { port: 3101 },
});
