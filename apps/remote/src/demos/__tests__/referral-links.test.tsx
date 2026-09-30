import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type {
  HostServices,
  ReferralStats,
} from "@paul-portfolio/work-portfolio-contract";
import ReferralLinksDemo from "../referral-links";
import { FEATURES, featureIndexBySlug } from "../../_data/catalog";
import { HostServicesProvider } from "../../services";

const feature = FEATURES[featureIndexBySlug("referral-links")!];

/**
 * The demo talks to the host's referrals service, never to fetch, so the
 * tests hand it one. Each method can be swapped per test.
 */
function referralsService(
  overrides: Partial<HostServices["referrals"]> = {},
): HostServices {
  return {
    referrals: {
      create: vi.fn().mockResolvedValue(CREATED),
      stats: vi.fn().mockResolvedValue(statsWith(0)),
      recordClick: vi.fn().mockResolvedValue({ slug: "abc123", clicks: 1 }),
      ...overrides,
    },
  };
}

const statsWith = (clicks: number): ReferralStats => ({
  slug: "abc123",
  targetPath: "/work-portfolio",
  clicks,
  recent: Array.from({ length: Math.min(clicks, 2) }, (_, i) => ({
    at: `2026-07-20T0${i + 1}:00:00.000Z`,
  })),
});

function renderWithClient(ui: ReactNode, services = referralsService()) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <HostServicesProvider services={services}>{ui}</HostServicesProvider>
    </QueryClientProvider>,
  );
}

const CREATED = {
  slug: "abc123",
  targetPath: "/work-portfolio",
  label: null,
  url: "https://paulsumido.com/r/abc123",
  clicks: 0,
  createdAt: "2026-07-20T00:00:00.000Z",
};

describe("referral links demo", () => {
  it("creates a real referral link and renders the returned url", async () => {
    const services = referralsService();
    renderWithClient(<ReferralLinksDemo feature={feature} />, services);

    fireEvent.click(screen.getByRole("button", { name: /create link/i }));

    // The link is shown on the current origin (so a develop link opens develop),
    // with the path from the API preserved.
    expect(await screen.findByText(/\/r\/abc123/)).toBeInTheDocument();
    expect(services.referrals.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: undefined }),
    );
  });

  it("falls back to a local preview link on the current origin when the API is unreachable", async () => {
    renderWithClient(
      <ReferralLinksDemo feature={feature} />,
      referralsService({
        create: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /create link/i }));

    // A link on this origin, not a red network error.
    const code = await screen.findByText(
      new RegExp(`${window.location.origin}/r/`),
    );
    expect(code).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(/API offline/i)).toBeInTheDocument();
  });

  it("surfaces a taken slug as a friendly error", async () => {
    renderWithClient(
      <ReferralLinksDemo feature={feature} />,
      referralsService({
        create: vi.fn().mockRejectedValue(new Error("That slug is already taken.")),
      }),
    );

    fireEvent.change(screen.getByLabelText(/custom slug/i), {
      target: { value: "taken" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create link/i }));

    expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
  });

  it("shows real click stats for the created link", async () => {
    renderWithClient(
      <ReferralLinksDemo feature={feature} />,
      referralsService({ stats: vi.fn().mockResolvedValue(statsWith(5)) }),
    );
    fireEvent.click(screen.getByRole("button", { name: /create link/i }));

    const stats = await screen.findByLabelText("Referral stats");
    expect(await within(stats).findByTestId("stats-total")).toHaveTextContent(
      "5",
    );
  });

  it("shows an empty state when the link has no clicks yet", async () => {
    renderWithClient(<ReferralLinksDemo feature={feature} />);
    fireEvent.click(screen.getByRole("button", { name: /create link/i }));

    expect(await screen.findByText(/no clicks yet/i)).toBeInTheDocument();
  });
});
