"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateReferralInput,
  Referral,
  ReferralStats,
} from "@/lib/referrals";
import { useHostServices } from "@/services";

/** Create a referral link. On success returns the slug + shareable url. */
export function useCreateReferral() {
  const { referrals } = useHostServices();
  return useMutation<Referral, Error, CreateReferralInput>({
    mutationFn: (input) => referrals.create(input),
  });
}

/**
 * Poll a referral's click stats. Disabled until a slug exists; refetches on an
 * interval so the demo shows counts ticking up.
 */
export function useReferralStats(slug: string | null) {
  const { referrals } = useHostServices();
  return useQuery<ReferralStats>({
    queryKey: ["referrals", "stats", slug],
    queryFn: () => referrals.stats(slug as string),
    enabled: Boolean(slug),
    refetchInterval: 10_000,
  });
}

/**
 * Record a click on a referral link. On success it invalidates that link's
 * stats query so the count moves live — no manual refetch from the caller.
 */
export function useRecordReferralClick() {
  const { referrals } = useHostServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => referrals.recordClick(slug),
    onSuccess: (_data, slug) =>
      queryClient.invalidateQueries({
        queryKey: ["referrals", "stats", slug],
      }),
  });
}
