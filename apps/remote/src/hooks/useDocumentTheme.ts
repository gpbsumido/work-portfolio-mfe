import { useSyncExternalStore } from "react";

/**
 * The page's light/dark theme, read from data-theme on <html>. The host owns
 * the theme and stamps that attribute; the remote just follows it, so a toggle
 * in the host's header re-renders anything here that cares.
 */
export function useDocumentTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, read, () => "light");
}

const read = (): "light" | "dark" =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
