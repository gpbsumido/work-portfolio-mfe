import type { Catalog } from "@paul-portfolio/work-portfolio-contract";
import { PROJECTS, FEATURES } from "./catalog";

/**
 * The catalog as the host sees it, written to dist/catalog.json at build time.
 * Kept to exactly the contract's shape so the host can parse it strictly.
 */
export function toCatalogJson(): Catalog {
  return { projects: PROJECTS, features: FEATURES };
}
