import { describe, it, expect } from "vitest";
import postcss from "postcss";
import { scopeSelector, scopeToRemote, REMOTE_SCOPE } from "./postcss-scope.mjs";

const WHERE = `:where(.${REMOTE_SCOPE}, .${REMOTE_SCOPE} *)`;

describe("scopeSelector", () => {
  it("confines a utility to the remote's subtree, without adding specificity", () => {
    expect(scopeSelector(".hidden")).toBe(`.hidden${WHERE}`);
  });

  it("scopes each selector in a list", () => {
    expect(scopeSelector(".a, .b:hover")).toBe(`.a${WHERE}, .b:hover${WHERE}`);
  });

  it("keeps pseudo-elements last, where CSS requires them", () => {
    expect(scopeSelector(".placeholder\\:text-muted::placeholder")).toBe(
      `.placeholder\\:text-muted${WHERE}::placeholder`,
    );
    expect(scopeSelector(".before\\:x:before")).toBe(`.before\\:x${WHERE}:before`);
  });

  it("scopes the element a combinator selector actually styles", () => {
    expect(scopeSelector(":where(.space-y-2>:not(:last-child))")).toBe(
      `:where(.space-y-2>:not(:last-child))${WHERE}`,
    );
  });
});

describe("the postcss plugin", () => {
  const run = (css: string) =>
    postcss([scopeToRemote()]).process(css, { from: undefined }).css;

  it("scopes rules nested in at-rules", () => {
    expect(run("@media (min-width:40rem){.sm\\:flex{display:flex}}")).toBe(
      `@media (min-width:40rem){.sm\\:flex${WHERE}{display:flex}}`,
    );
  });

  it("leaves keyframe steps alone", () => {
    const css = "@keyframes pulse{0%{opacity:1}to{opacity:.5}}";
    expect(run(css)).toBe(css);
  });

  it("leaves Tailwind's --tw-* initialisers alone, since they style nothing", () => {
    const css = "*,:before,:after,::backdrop{--tw-shadow:0 0 #0000}";
    expect(run(css)).toBe(css);
  });
});

describe("the scope class", () => {
  it("is the same class the components put on the remote's roots", async () => {
    const { REMOTE_SCOPE: fromSrc } = await import("../src/scope");
    expect(REMOTE_SCOPE).toBe(fromSrc);
  });
});
