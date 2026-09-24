import { describe, it, expect, vi, afterEach } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import type { HostContext } from "@paul-portfolio/work-portfolio-contract";
import { mount } from "../mount";
import { PROJECTS, FEATURES } from "../_data/catalog";
import { fakeHostServices } from "../../dev/fakeHostServices";

/** A fresh host context per test, with the callbacks spied on. */
const hostContext = (overrides: Partial<HostContext> = {}): HostContext => ({
  initialFeature: null,
  onFeatureChange: vi.fn(),
  services: fakeHostServices(),
  ...overrides,
});

/** Mounts into a detached-then-attached element, the way the host does. */
const mountInto = (ctx: HostContext) => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  let handle!: ReturnType<typeof mount>;
  act(() => {
    handle = mount(el, ctx);
  });
  return { el, handle };
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("mount", () => {
  it("renders the intro card into the given element", () => {
    const { el } = mountInto(hostContext());
    expect(
      within(el).getByRole("heading", {
        name: `${PROJECTS.length} projects · ${FEATURES.length} feature demos`,
      }),
    ).toBeInTheDocument();
  });

  it("opens the demo the host passes as initialFeature", async () => {
    const target = FEATURES[3];
    mountInto(hostContext({ initialFeature: target.slug }));
    expect(
      await screen.findByRole("heading", { level: 1, name: target.title }),
    ).toBeInTheDocument();
  });

  it("switches the demo on stage when the host calls update", async () => {
    const target = FEATURES[5];
    const { handle } = mountInto(hostContext());
    act(() => handle.update({ initialFeature: target.slug }));
    expect(
      await screen.findByRole("heading", { level: 1, name: target.title }),
    ).toBeInTheDocument();
  });

  it("reports the next slug on ArrowRight and never touches history itself", async () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");
    const onFeatureChange = vi.fn();
    mountInto(hostContext({ onFeatureChange }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });

    await waitFor(() =>
      expect(onFeatureChange).toHaveBeenLastCalledWith(FEATURES[0].slug),
    );
    expect(replaceState).not.toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
  });

  it("empties the element and stops listening for arrow keys on unmount", () => {
    const onFeatureChange = vi.fn();
    const { el, handle } = mountInto(hostContext({ onFeatureChange }));

    act(() => handle.unmount());
    onFeatureChange.mockClear();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    expect(el).toBeEmptyDOMElement();
    expect(onFeatureChange).not.toHaveBeenCalled();
  });
});
