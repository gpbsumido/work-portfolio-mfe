import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CatalogSchema } from "@paul-portfolio/work-portfolio-contract";
import postcss from "postcss";
import { globalSelectors } from "../scripts/cssScope";
import { REMOTE_SCOPE } from "../src/scope";

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

  it("confines every rule it ships to the host to the remote's scope class", () => {
    const unscoped = mountCss()
      .map((file) => readFileSync(join(DIST, file), "utf8"))
      .flatMap((css) =>
        postcss.parse(css).nodes.flatMap(function walk(node): string[] {
          if (node.type === "atrule") {
            return /keyframes$/i.test(node.name) ? [] : (node.nodes ?? []).flatMap(walk);
          }
          if (node.type !== "rule") return [];
          const onlyTwVars = node.nodes.every(
            (d) => d.type === "decl" && d.prop.startsWith("--tw-"),
          );
          return onlyTwVars || node.selector.includes(`.${REMOTE_SCOPE}`)
            ? []
            : [node.selector];
        }),
      );
    // RainbowKit's stylesheet is scoped by its own [data-rk] root instead
    expect(unscoped.filter((s) => !s.includes("[data-rk]"))).toEqual([]);
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
