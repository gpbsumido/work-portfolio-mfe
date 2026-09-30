import "../dev/standalone.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import { createInstance } from "@module-federation/runtime";
import {
  isCompatibleContract,
  type MountHandle,
  type RemoteModule,
} from "@paul-portfolio/work-portfolio-contract";
import { fakeHostServices } from "../dev/fakeHostServices";

/**
 * A stand-in host for CI. It loads the BUILT remote over the federation
 * runtime, the same calls paul-explore makes, so a remote change that breaks
 * mounting fails here before it ever reaches the real site.
 *
 * It records what the remote reports on window.__harness for the e2e specs.
 */
declare global {
  interface Window {
    __harness: {
      status: "loading" | "mounted" | "incompatible" | "failed";
      changes: (string | null)[];
      remoteVersion?: string;
      unmount?: () => void;
    };
  }
}

const REMOTE_MANIFEST = "http://localhost:3100/mf-manifest.json";
const shareConfig = { singleton: true, requiredVersion: false } as const;

window.__harness = { status: "loading", changes: [] };

const mf = createInstance({
  name: "harness",
  remotes: [{ name: "workPortfolio", entry: REMOTE_MANIFEST }],
  shared: {
    react: { version: React.version, lib: () => React, shareConfig },
    "react-dom": { version: React.version, lib: () => ReactDOM, shareConfig },
    "react-dom/client": {
      version: React.version,
      lib: () => ReactDOMClient,
      shareConfig,
    },
  },
});

async function boot() {
  const el = document.getElementById("root");
  if (!el) throw new Error("harness page is missing #root");
  el.setAttribute("style", "display:flex;flex-direction:column;height:100vh");

  const remote = await mf.loadRemote<RemoteModule>("workPortfolio/mount");
  if (!remote || !isCompatibleContract(remote.contractVersion)) {
    window.__harness.status = "incompatible";
    return;
  }

  const handle: MountHandle = remote.mount(el, {
    initialFeature: new URLSearchParams(window.location.search).get("feature"),
    onFeatureChange: (slug) => window.__harness.changes.push(slug),
    services: fakeHostServices(),
  });
  window.__harness.status = "mounted";
  window.__harness.remoteVersion = remote.version;
  window.__harness.unmount = () => handle.unmount();
}

boot().catch((error: unknown) => {
  console.error(error);
  window.__harness.status = "failed";
});
