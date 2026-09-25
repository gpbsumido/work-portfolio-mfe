import "./styles.css";
import { createRoot } from "react-dom/client";
import { LazyMotion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CONTRACT_VERSION,
  type HostContext,
  type MountHandle,
} from "@paul-portfolio/work-portfolio-contract";
import WorkPortfolioContent from "./WorkPortfolioContent";
import { HostServicesProvider } from "./services";

/** The contract major this build was compiled against. The host checks it before mounting. */
export const contractVersion = CONTRACT_VERSION;

/** This remote's release, shown on the host's provenance chip. */
export const version: string = __REMOTE_VERSION__;

// Same lazy feature bundle the host uses, so the `m` components stay light.
const loadMotionFeatures = () =>
  import("framer-motion").then((mod) => mod.domMax);

/**
 * The one thing this remote exposes. Renders the whole work portfolio into
 * `el` with its own React root and query cache, and hands back the only two
 * ways the host can touch it afterwards.
 *
 * Nothing here knows about Next.js. The host could be any framework that can
 * give us an element.
 */
export function mount(el: HTMLElement, ctx: HostContext): MountHandle {
  const root = createRoot(el);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  });
  let current = ctx;

  const render = () =>
    root.render(
      <QueryClientProvider client={queryClient}>
        <HostServicesProvider services={current.services}>
          <LazyMotion features={loadMotionFeatures}>
            <WorkPortfolioContent
              initialFeature={current.initialFeature}
              onFeatureChange={current.onFeatureChange}
            />
          </LazyMotion>
        </HostServicesProvider>
      </QueryClientProvider>,
    );

  render();

  return {
    update(next) {
      current = { ...current, ...next };
      render();
    },
    unmount() {
      root.unmount();
      queryClient.clear();
    },
  };
}
