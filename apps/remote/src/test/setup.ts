import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";
import * as axeMatchers from "vitest-axe/matchers";
import { expect, vi } from "vitest";

expect.extend(axeMatchers);

// jsdom gaps the demos rely on. Individual tests can still override matchMedia
// (e.g. to emulate reduced motion) with vi.stubGlobal.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver ??=
  MockObserver as unknown as typeof IntersectionObserver;
window.ResizeObserver ??= MockObserver as unknown as typeof ResizeObserver;

// jsdom has no canvas; returning null is what a browser without 2d support
// does, so the chart demos take their no-canvas path instead of logging noise.
HTMLCanvasElement.prototype.getContext = () => null;
