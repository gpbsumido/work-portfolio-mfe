# Changelog

## 1.0.0 — September 25, 2026

The work portfolio moves out of paul-explore into its own repo.

- `@paul-portfolio/work-portfolio-contract` 1.0.0: mount types, host services, catalog schema and the contract version handshake.
- The remote exposes `./mount` over Module Federation 2.0, shares the host's React, and serves `catalog.json` beside its manifest.
- The shell no longer touches the URL; it takes `initialFeature` and reports `onFeatureChange`.
- The referral demo goes through `services.referrals` instead of calling the API itself.
- Standalone dev with fake host services, a stand-in host harness, and e2e against the built output.
- Fixed: the realtime-metrics chart had an `aria-label` on a `div` with no role. The a11y test only caught it once it started rendering a demo instead of the intro card.
