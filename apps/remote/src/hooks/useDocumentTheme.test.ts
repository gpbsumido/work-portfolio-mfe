import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDocumentTheme } from "./useDocumentTheme";

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("useDocumentTheme", () => {
  it("follows the host's data-theme attribute as it changes", async () => {
    document.documentElement.dataset.theme = "light";
    const { result } = renderHook(() => useDocumentTheme());
    expect(result.current).toBe("light");

    await act(async () => {
      document.documentElement.dataset.theme = "dark";
      // MutationObserver callbacks run as a microtask
      await Promise.resolve();
    });
    expect(result.current).toBe("dark");
  });
});
