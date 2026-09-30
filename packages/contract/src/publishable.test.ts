import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

/**
 * The built package has to load in plain Node ESM, not just through a
 * bundler. paul-explore's Vitest treats node_modules as external, so it
 * imports dist/ exactly like this. tsc with bundler resolution happily emitted
 * `from "./catalog"`, which bundlers accept and Node refuses, and it only
 * passed in the host because a local link: dependency got bundled instead.
 * Needs `pnpm build` first (the root test script does it).
 */
describe("the published build", () => {
  it("imports in plain Node ESM", () => {
    const entry = join(import.meta.dirname, "../dist/index.js");
    const out = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const m = await import(${JSON.stringify(entry)}); console.log(typeof m.CatalogSchema.safeParse, m.CONTRACT_VERSION);`,
      ],
      { encoding: "utf8" },
    );
    expect(out.trim()).toBe("function 1");
  });
});
