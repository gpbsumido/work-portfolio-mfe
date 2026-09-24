import { defineConfig, type RsbuildPlugin } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import pkg from "./package.json" with { type: "json" };
import { toCatalogJson } from "./src/_data/catalogJson";

// React has to be one instance on the host page. The host (paul-explore on
// Next 16) hands over its own copy, and Next vendors a canary build, so its
// version reads like 19.3.0-canary-cbb046ab-20260731. A plain ^19 range would
// reject that as a prerelease; the -0 lets prereleases of 19 through.
const REACT_RANGE = "^19.0.0-0";

/**
 * Writes catalog.json next to the manifest. The host's write-up page reads it
 * for its project and feature counts, so the host never has to import the
 * catalog (or rebuild) to stay correct.
 */
const pluginCatalogJson = (): RsbuildPlugin => ({
  name: "work-portfolio:catalog-json",
  setup(api) {
    api.processAssets({ stage: "additional" }, ({ compilation, sources }) => {
      compilation.emitAsset(
        "catalog.json",
        new sources.RawSource(JSON.stringify(toCatalogJson())),
      );
    });
  },
});

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginCatalogJson(),
    pluginModuleFederation({
      name: "workPortfolio",
      exposes: { "./mount": "./src/mount.tsx" },
      shared: {
        react: { singleton: true, requiredVersion: REACT_RANGE },
        "react-dom": { singleton: true, requiredVersion: REACT_RANGE },
        "react-dom/client": { singleton: true, requiredVersion: REACT_RANGE },
      },
      dts: false,
    }),
  ],
  source: {
    entry: { index: "./dev/standalone.tsx" },
    define: { __REMOTE_VERSION__: JSON.stringify(pkg.version) },
  },
  resolve: { alias: { "@": "./src" } },
  html: { title: "Work Portfolio (standalone)" },
  output: {
    // chunks resolve against wherever remoteEntry.js was loaded from, so the
    // same build works on its own origin and inside the host page
    assetPrefix: "auto",
  },
  server: {
    port: 3100,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
});
