import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CatalogSchema } from "@paul-portfolio/work-portfolio-contract";
import { globalSelectors } from "../scripts/cssScope";

const DIST = join(import.meta.dirname, "../dist");

type Manifest = {
  name: string;
  exposes: {
    path: string;
    assets: { css: { sync: string[]; async: string[] } };
  }[];
};

const manifest = (): Manifest =>
  JSON.parse(readFileSync(join(DIST, "mf-manifest.json"), "utf8"));

/**
 * The stylesheets the host actually pulls in: whatever the manifest attaches
 * to ./mount, sync and async. The standalone page's own CSS (index.*.css) is
 * deliberately global, since there it plays host, and never reaches the host.
 */
const mountCss = (): string[] => {
  const mount = manifest().exposes.find((e) => e.path === "./mount");
  return mount ? [...mount.assets.css.sync, ...mount.assets.css.async] : [];
};

describe("built output", () => {
  it("attaches at least one stylesheet to ./mount (so the check below can fail)", () => {
    expect(mountCss().length).toBeGreaterThan(0);
  });

  it("ships no CSS to the host that styles the page outside the remote", () => {
    const leaks = mountCss()
      .map((file) => readFileSync(join(DIST, file), "utf8"))
      .flatMap(globalSelectors);
    expect(leaks).toEqual([]);
  });

  it("serves a catalog.json that parses against the contract", () => {
    const raw = readFileSync(join(DIST, "catalog.json"), "utf8");
    expect(CatalogSchema.safeParse(JSON.parse(raw)).success).toBe(true);
  });

  it("serves the federation manifest the host loads", () => {
    expect(manifest().name).toBe("workPortfolio");
    expect(manifest().exposes.map((e) => e.path)).toContain("./mount");
  });
});
