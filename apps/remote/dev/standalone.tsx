import "./standalone.css";
import { mount, version } from "../src/mount";
import { fakeHostServices } from "./fakeHostServices";

/**
 * The remote on its own, playing host: the page you get from `pnpm dev`, and
 * what the remote's own origin serves. It mounts exactly the way paul-explore
 * does, through mount(), with in-memory services instead of the real API.
 */
const root = document.getElementById("root");
if (!root) throw new Error("standalone page is missing #root");

const banner = document.createElement("p");
banner.textContent = `Work portfolio remote v${version} · standalone, fake host services`;
banner.setAttribute(
  "style",
  "margin:0;padding:6px 12px;font:12px ui-monospace,monospace;opacity:.7;border-bottom:1px solid var(--paul-color-border)",
);

const stage = document.createElement("div");
stage.setAttribute("style", "display:flex;flex-direction:column;height:calc(100% - 30px)");
root.append(banner, stage);

const params = new URLSearchParams(window.location.search);
mount(stage, {
  initialFeature: params.get("feature"),
  onFeatureChange(slug) {
    // playing host means owning the URL too
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("feature", slug);
    else url.searchParams.delete("feature");
    window.history.replaceState(null, "", url);
  },
  services: fakeHostServices(),
});
