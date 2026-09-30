"use client";

import { lazy, Suspense, type ComponentType } from "react";
import { FEATURES } from "../_data/catalog";
import type { WorkFeature } from "../_data/types";
import ComingSoonDemo from "./ComingSoonDemo";
import DemoSkeleton from "./DemoSkeleton";

export type DemoComponent = ComponentType<{ feature: WorkFeature }>;

/**
 * A demo behind React.lazy, with the skeleton while its chunk loads. Built
 * once at module scope, so the component identity never changes between
 * renders and a demo never remounts just because the stage re-rendered.
 */
function lazyDemo(
  load: () => Promise<{ default: DemoComponent }>,
): DemoComponent {
  const Lazy = lazy(load);
  return function LazyDemo(props) {
    return (
      <Suspense fallback={<DemoSkeleton />}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

/**
 * Real demos, one line per shipped demo. Each lives in its own file behind
 * React.lazy so the page only ships the chunk for the demo on screen.
 * Demo PRs add exactly one line here each, which keeps them independent.
 */
const SHIPPED: Partial<Record<string, DemoComponent>> = {
  "realtime-metrics": lazyDemo(() => import("./realtime-metrics")),
  "chart-library": lazyDemo(() => import("./chart-library")),
  "standard-analytics": lazyDemo(() => import("./standard-analytics")),
  "per-game-analytics": lazyDemo(() => import("./per-game-analytics")),
  "slug-dashboards": lazyDemo(() => import("./slug-dashboards")),
  "dashboard-designer": lazyDemo(() => import("./dashboard-designer")),
  "wallet-lookup": lazyDemo(() => import("./wallet-lookup")),
  "llm-assistant": lazyDemo(() => import("./llm-assistant")),
  "email-campaigns": lazyDemo(() => import("./email-campaigns")),
  "workflow-editor": lazyDemo(() => import("./workflow-editor")),
  "signup-flow": lazyDemo(() => import("./signup-flow")),
  "admin-suite": lazyDemo(() => import("./admin-suite")),
  "ai-content-engine": lazyDemo(() => import("./ai-content-engine")),
  "ua-campaign-builder": lazyDemo(() => import("./ua-campaign-builder")),
  "referral-links": lazyDemo(() => import("./referral-links")),
  "auth-flows": lazyDemo(() => import("./auth-flows")),
  "campaign-manager": lazyDemo(() => import("./campaign-manager")),
  "post-queue": lazyDemo(() => import("./post-queue")),
  "community-mode": lazyDemo(() => import("./community-mode")),
  "character-sheets": lazyDemo(() => import("./character-sheets")),
  "game-demo": lazyDemo(() => import("./game-demo")),
  "nft-inventory": lazyDemo(() => import("./nft-inventory")),
  "this-site": lazyDemo(() => import("./this-site")),
};

/**
 * Every slug resolved up front, coming-soon placeholder where no demo has
 * shipped yet. Built at module scope so render code does a plain lookup.
 */
/** Slugs with a real demo behind them, as opposed to the coming-soon card. */
export const DEMO_SLUGS: readonly string[] = Object.keys(SHIPPED);

export const DEMO_BY_SLUG: Record<string, DemoComponent> = Object.fromEntries(
  FEATURES.map((f) => [f.slug, SHIPPED[f.slug] ?? ComingSoonDemo]),
);
