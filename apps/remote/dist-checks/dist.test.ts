import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CatalogSchema } from "@paul-portfolio/work-portfolio-contract";
import { globalSelectors } from "../scripts/cssScope";

const DIST = join(__dirname, "../dist");
const CSS_DIR = join(DIST, "static/css");

/** Every stylesheet the build emitted, async chunks included. */
const cssFiles = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true, encoding: "utf8" })
        .filter((f) => f.endsWith(".css"))
        .map((f) => join(dir, f))
    : [];

/**
 * RainbowKit's stylesheet ships inside the nft-inventory chunk and resets
 * elements under its own [data-rk] root. That is scoped, just not by class,
 * so its file is checked for the attribute instead of skipped outright.
 */
const isRainbowKit = (css: string) => css.includes("[data-rk]");

describe("built output", () => {
  it("emitted at least one stylesheet (so the check below can fail)", () => {
    expect(cssFiles(CSS_DIR).length).toBeGreaterThan(0);
  });

  it("ships no CSS that styles the host page outside the remote", () => {
    const leaks = cssFiles(CSS_DIR)
      .map((file) => readFileSync(file, "utf8"))
      .filter((css) => !isRainbowKit(css))
      .flatMap(globalSelectors);
    expect(leaks).toEqual([]);
  });

  it("serves a catalog.json that parses against the contract", () => {
    const raw = readFileSync(join(DIST, "catalog.json"), "utf8");
    expect(CatalogSchema.safeParse(JSON.parse(raw)).success).toBe(true);
  });

  it("serves the federation manifest the host loads", () => {
    const manifest = JSON.parse(
      readFileSync(join(DIST, "mf-manifest.json"), "utf8"),
    );
    expect(manifest.name).toBe("workPortfolio");
    expect(manifest.exposes.map((e: { path: string }) => e.path)).toContain(
      "./mount",
    );
  });
});
