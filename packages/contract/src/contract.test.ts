import { describe, it, expect } from "vitest";
import {
  CONTRACT_VERSION,
  CatalogSchema,
  isCompatibleContract,
  type Catalog,
} from "./index.js";

const project = (overrides: Partial<Catalog["projects"][number]> = {}) => ({
  id: "atlas",
  name: "Atlas",
  blurb: "An analytics suite.",
  stack: "React, D3",
  accent: { accent: "#123456", surface: "#12345610", font: "sans" as const },
  cutFeatures: [],
  ...overrides,
});

const feature = (overrides: Partial<Catalog["features"][number]> = {}) => ({
  slug: "realtime-metrics",
  projectId: "atlas",
  title: "Realtime metrics",
  tagline: "Live counters",
  icon: "📈",
  explainer: { did: "did", stack: "stack", mocked: "mocked" },
  ...overrides,
});

const catalog = (overrides: Partial<Catalog> = {}) => ({
  projects: [project()],
  features: [feature()],
  ...overrides,
});

describe("catalog schema", () => {
  it("accepts a well-formed catalog", () => {
    expect(CatalogSchema.safeParse(catalog()).success).toBe(true);
  });

  it("rejects a feature whose slug is not url-safe, since slugs are deep-link ids", () => {
    const result = CatalogSchema.safeParse(
      catalog({ features: [feature({ slug: "Realtime Metrics" })] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects duplicate feature slugs", () => {
    const result = CatalogSchema.safeParse(
      catalog({ features: [feature(), feature()] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a feature pointing at a project that is not in the catalog", () => {
    const result = CatalogSchema.safeParse(
      catalog({ features: [feature({ projectId: "nowhere" })] }),
    );
    expect(result.success).toBe(false);
  });
});

describe("contract version handshake", () => {
  it("accepts a remote on the same major", () => {
    expect(isCompatibleContract(CONTRACT_VERSION)).toBe(true);
  });

  it("refuses a remote on a different major", () => {
    expect(isCompatibleContract(CONTRACT_VERSION + 1)).toBe(false);
  });

  it("refuses anything that is not a version number", () => {
    expect(isCompatibleContract("1")).toBe(false);
    expect(isCompatibleContract(undefined)).toBe(false);
  });
});
