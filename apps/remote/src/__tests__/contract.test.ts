import { describe, it, expect } from "vitest";
import {
  CONTRACT_VERSION,
  CatalogSchema,
  type RemoteModule,
} from "@paul-portfolio/work-portfolio-contract";
import * as exposed from "../mount";
import { DEMO_SLUGS } from "../demos/registry";
import { toCatalogJson } from "../_data/catalogJson";

/**
 * Slugs paul-explore links to with ?feature=. They are public ids: renaming one
 * breaks a link on a site this repo does not deploy, so this list only ever
 * grows. Sources: src/app/r/[slug]/ReferralLanding.tsx and
 * e2e/public/work-portfolio.spec.ts in paul-explore.
 */
const HOST_DEEP_LINKS = ["referral-links", "wallet-lookup", "chart-library"];

describe("the exposed module", () => {
  it("satisfies the RemoteModule contract", () => {
    const remote: RemoteModule = exposed;
    expect(typeof remote.mount).toBe("function");
  });

  it("declares the contract major it was built against", () => {
    expect(exposed.contractVersion).toBe(CONTRACT_VERSION);
  });

  it("reports its own semver version for the host's provenance chip", () => {
    expect(exposed.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("catalog.json", () => {
  it("parses against the contract's catalog schema", () => {
    expect(CatalogSchema.safeParse(toCatalogJson()).success).toBe(true);
  });

  it("has a real demo for every slug the host deep-links to", () => {
    const slugs = toCatalogJson().features.map((f) => f.slug);
    const missing = HOST_DEEP_LINKS.filter(
      (slug) => !slugs.includes(slug) || !DEMO_SLUGS.includes(slug),
    );
    expect(missing).toEqual([]);
  });

  it("only registers demos for features that exist in the catalog", () => {
    const slugs = toCatalogJson().features.map((f) => f.slug);
    expect(DEMO_SLUGS.filter((slug) => !slugs.includes(slug))).toEqual([]);
  });
});
