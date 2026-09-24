import { describe, it, expect } from "vitest";
import { globalSelectors } from "./cssScope";

describe("globalSelectors", () => {
  it("passes class-scoped utility rules", () => {
    expect(globalSelectors(".flex{display:flex}.bg-surface:hover{color:red}")).toEqual([]);
  });

  it("flags rules on html, body, and bare elements", () => {
    expect(
      globalSelectors("html{font-size:10px}body{margin:0}button{all:unset}"),
    ).toEqual(["html", "body", "button"]);
  });

  it("flags the universal selector when it sets real properties", () => {
    expect(globalSelectors("*{box-sizing:content-box}")).toEqual(["*"]);
  });

  it("flags :root rules, since the host owns the theme variables", () => {
    expect(globalSelectors(":root{--color-muted:red}")).toEqual([":root"]);
  });

  it("allows Tailwind's --tw-* property fallbacks, which only initialise its own variables", () => {
    expect(
      globalSelectors("*,:before,:after,::backdrop{--tw-shadow:0 0 #0000;--tw-ring-color:initial}"),
    ).toEqual([]);
  });

  it("looks inside @media and @layer blocks", () => {
    expect(
      globalSelectors("@layer base{@media (min-width:1px){body{margin:0}}}"),
    ).toEqual(["body"]);
  });

  it("ignores keyframe steps", () => {
    expect(
      globalSelectors("@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}"),
    ).toEqual([]);
  });
});
