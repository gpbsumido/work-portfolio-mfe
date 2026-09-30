import { z } from "zod";

/**
 * The work-portfolio catalog: past projects and the demoable features under
 * them. The remote owns it and serves it as catalog.json; the host only ever
 * reads it through this schema.
 */

/** Visual accent each project's demos carry inside the stage. */
export const AccentThemeSchema = z.object({
  /** primary accent color, hex */
  accent: z.string(),
  /** translucent surface tint used behind demo content */
  surface: z.string(),
  /** typography flavor for the demo surface */
  font: z.enum(["sans", "mono"]),
});

/** One of the past projects. Names are public-safe, never the real ones. */
export const WorkProjectSchema = z.object({
  id: z.string().min(1),
  /** anonymized public name shown in the top ticker */
  name: z.string().min(1),
  /** one-liner for the explainer window */
  blurb: z.string(),
  /** original stack, described without identifying details */
  stack: z.string(),
  accent: AccentThemeSchema,
  /** features that did not make the ticker, listed in the explainer */
  cutFeatures: z.array(z.string()),
});

/** One demoable feature, shown in the bottom ticker. */
export const WorkFeatureSchema = z.object({
  /** url-safe id used for ?feature= deep links, so it never changes once shipped */
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  projectId: z.string().min(1),
  title: z.string().min(1),
  /** short line shown on the chip and stage header */
  tagline: z.string(),
  /** small emoji icon shown on the chip */
  icon: z.string(),
  /** flagship demos get more depth than vignettes */
  flagship: z.boolean().optional(),
  explainer: z.object({
    /** what the feature did in the original app */
    did: z.string(),
    /** what it was built with originally */
    stack: z.string(),
    /** what is real vs faked in this reconstruction */
    mocked: z.string(),
  }),
});

export const CatalogSchema = z
  .object({
    projects: z.array(WorkProjectSchema),
    features: z.array(WorkFeatureSchema),
  })
  .superRefine((catalog, ctx) => {
    const projectIds = new Set(catalog.projects.map((p) => p.id));
    const seen = new Set<string>();
    catalog.features.forEach((feature, index) => {
      if (seen.has(feature.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["features", index, "slug"],
          message: `duplicate slug "${feature.slug}"`,
        });
      }
      seen.add(feature.slug);
      if (!projectIds.has(feature.projectId)) {
        ctx.addIssue({
          code: "custom",
          path: ["features", index, "projectId"],
          message: `unknown project "${feature.projectId}"`,
        });
      }
    });
  });

export type AccentTheme = z.infer<typeof AccentThemeSchema>;
export type WorkProject = z.infer<typeof WorkProjectSchema>;
export type WorkFeature = z.infer<typeof WorkFeatureSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
