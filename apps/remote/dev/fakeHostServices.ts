import type {
  HostServices,
  Referral,
} from "@paul-portfolio/work-portfolio-contract";

/**
 * In-memory stand-in for the host's services, used by standalone dev and the
 * tests. It behaves like portfolio_api closely enough for the referral demo:
 * slugs are unique, clicks count up, stats read back what was recorded.
 */
export function fakeHostServices(): HostServices {
  const links = new Map<string, Referral>();
  const clicks = new Map<string, string[]>();

  const find = (slug: string) => {
    const link = links.get(slug);
    if (!link) throw new Error("That referral link does not exist.");
    return link;
  };

  return {
    referrals: {
      async create({ slug, targetPath = "/", label }) {
        const id = slug ?? `demo-${links.size + 1}`;
        if (links.has(id)) throw new Error("That slug is already taken.");
        const link: Referral = {
          slug: id,
          targetPath,
          label: label ?? null,
          url: `${window.location.origin}/r/${id}`,
          clicks: 0,
          createdAt: new Date().toISOString(),
        };
        links.set(id, link);
        clicks.set(id, []);
        return link;
      },
      async stats(slug) {
        const link = find(slug);
        const recent = (clicks.get(slug) ?? []).map((at) => ({ at }));
        return { slug, targetPath: link.targetPath, clicks: recent.length, recent };
      },
      async recordClick(slug) {
        find(slug);
        const next = [...(clicks.get(slug) ?? []), new Date().toISOString()];
        clicks.set(slug, next);
        return { slug, clicks: next.length };
      },
    },
  };
}
