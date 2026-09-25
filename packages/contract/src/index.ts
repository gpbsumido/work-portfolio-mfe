/**
 * Everything that crosses the boundary between paul-explore (the host) and
 * the work-portfolio remote. Both sides type-check against this package, and
 * nothing else is shared between them except the design-system tokens.
 */

export {
  AccentThemeSchema,
  WorkProjectSchema,
  WorkFeatureSchema,
  CatalogSchema,
  type AccentTheme,
  type WorkProject,
  type WorkFeature,
  type Catalog,
} from "./catalog";

/**
 * The contract's major version. The host refuses a remote built against a
 * different major and shows its fallback instead, so a breaking change ships
 * as: host learns both majors, remote moves, host drops the old one.
 */
export const CONTRACT_VERSION = 1;

/** Whether a remote's declared contract version is one this build can mount. */
export function isCompatibleContract(version: unknown): boolean {
  return typeof version === "number" && Math.floor(version) === CONTRACT_VERSION;
}

/** A referral link, as portfolio_api returns it. */
export type Referral = {
  slug: string;
  targetPath: string;
  label: string | null;
  url: string;
  clicks: number;
  createdAt: string;
};

export type ReferralStats = {
  slug: string;
  targetPath: string;
  clicks: number;
  recent: { at: string }[];
};

export type CreateReferralInput = {
  slug?: string;
  targetPath?: string;
  label?: string;
};

/**
 * Capabilities the host lends the remote. The remote never learns an API URL
 * or touches auth: it asks for data through these and the host decides how to
 * fetch it. An API refusal rejects with an Error whose message is fit to show
 * a user; an unreachable API rejects with a TypeError, the way fetch does, so
 * the remote can tell "no" apart from "offline".
 */
export type HostServices = {
  referrals: {
    create(input: CreateReferralInput): Promise<Referral>;
    stats(slug: string): Promise<ReferralStats>;
    recordClick(slug: string): Promise<{ slug: string; clicks: number }>;
  };
};

/**
 * What the host hands the remote on mount. The host owns the URL: the remote
 * reads the starting feature from here and reports changes back, and never
 * writes to history itself.
 */
export type HostContext = {
  /** slug from ?feature=, or null for the intro card */
  initialFeature: string | null;
  /** called whenever the selected feature changes; null means the intro card */
  onFeatureChange(slug: string | null): void;
  services: HostServices;
};

export type MountHandle = {
  /** re-render with part of the context replaced, e.g. a new initialFeature */
  update(next: Partial<HostContext>): void;
  /** tear everything down: React root, listeners, timers */
  unmount(): void;
};

/** The shape of the module the remote exposes as "./mount". */
export type RemoteModule = {
  contractVersion: number;
  /** the remote's own release, e.g. "1.4.0" */
  version: string;
  mount(el: HTMLElement, ctx: HostContext): MountHandle;
};
