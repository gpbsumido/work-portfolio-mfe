# work-portfolio-mfe

The work portfolio from [paul-explore](https://github.com/gpbsumido/paul-explore), split out as a micro-frontend. It has its own repo, build, deploy and release cadence, and paul-explore loads it at runtime over Module Federation 2.0.

It's the same feature demos from past projects that used to live at `src/app/work-portfolio` in paul-explore. That folder's history came with it (`git filter-repo`), so `git log` and `git blame` still go back to the first demo, and the old PR references point at `gpbsumido/paul-explore#NNN`.

## How it fits together

```
paul-explore (host, Next 16)              this repo (remote, Rsbuild)
─────────────────────────────             ─────────────────────────────
/work-portfolio page                      mf-manifest.json   (no-cache)
  └─ RemoteMount                          remoteEntry + chunks (immutable)
       ├─ @module-federation/runtime ──►  ./mount  →  mount(el, ctx)
       ├─ shares its React (singleton)    catalog.json
       └─ HostContext: initialFeature,
          onFeatureChange, services
```

- **One exposed module, `./mount`.** It's framework-agnostic: `mount(el, ctx)` returns `{ update, unmount }`. The host never renders the remote's React tree, it only hands it an element.
- **The contract is a package.** `@paul-portfolio/work-portfolio-contract` (in `packages/contract`) holds the mount types, the host services, the catalog schema and `CONTRACT_VERSION`. Both repos type-check against it. The host refuses a remote on a different major and shows its fallback.
- **The host owns the URL and the theme.** The remote gets the starting `?feature=` slug and reports selection changes back; it never touches `history`. Light/dark and the design tokens come from the host page's CSS variables.
- **The host owns data access.** The referral demo calls `services.referrals`, so the remote never learns the API URL.
- **React is shared.** The host hands over its own React as a singleton. Next vendors a canary build (`19.3.0-canary-…`), which is why the range here is `^19.0.0-0`.
- **CSS stays inside the remote.** Tailwind utilities only: no preflight, no `:root` variables, nothing on `html`/`body`. `dist-checks/dist.test.ts` fails the build if a global selector reaches the CSS attached to `./mount`.

## Working on it

```bash
pnpm install
pnpm dev          # standalone on http://localhost:3100, with in-memory host services
pnpm test         # contract + remote unit tests
pnpm typecheck
```

Standalone mode mounts through the same `mount()` the host uses, with `dev/fakeHostServices.ts` standing in for the real API. `?feature=<slug>` works there too.

### Checking the build the way the host sees it

```bash
pnpm --filter work-portfolio-remote build
pnpm --filter work-portfolio-remote test:dist        # CSS scope, catalog.json, manifest
pnpm --filter work-portfolio-remote build:harness
pnpm test:e2e                                         # built remote, mounted by a stand-in host
```

The harness (`apps/remote/harness`) is a separate app on its own port that loads the built remote over `@module-federation/runtime`. It makes the same calls paul-explore makes, so a remote that can't mount fails here instead of on the site.

## Deploying

The remote deploys to Vercel as a static site (`vercel.json`). The manifest and `catalog.json` are served `no-cache` and the hashed chunks as immutable, so:

- a merge to `main` goes live on paul-explore without a paul-explore deploy
- a Vercel instant rollback of this project rolls the portfolio back, and the host stays as it is

The contract publishes to npm from `main` through trusted publishing, and only when `packages/contract/package.json` has a new version.

## Rules for changing the boundary

- **Feature slugs are public ids.** paul-explore deep-links to some of them; `src/__tests__/contract.test.ts` lists which ones and fails if one disappears.
- **Breaking the contract means a new major, shipped in steps**: the host learns both majors, the remote moves, the host drops the old one.
- **Nothing in `./mount`'s CSS may style outside the remote.**
