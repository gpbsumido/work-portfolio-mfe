/**
 * Finds selectors in a stylesheet that would style the host page outside the
 * remote: :root, html, body, the universal selector, or a bare element.
 * Tailwind's own `*` block that only initialises --tw-* variables is allowed,
 * because it sets nothing the host can see.
 */
export function globalSelectors(css: string): string[] {
  return rules(stripComments(css)).flatMap(({ selector, body }) =>
    selector
      .split(",")
      .map((s) => s.trim())
      .filter((s) => isGlobal(s) && !onlyTailwindVars(body)),
  );
}

type Rule = { selector: string; body: string };

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Flattens nested at-rules into plain style rules, dropping keyframe steps. */
function rules(css: string): Rule[] {
  const out: Rule[] = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    const close = matchingBrace(css, open);
    const inner = css.slice(open + 1, close);
    if (prelude.startsWith("@keyframes") || prelude.startsWith("@font-face") || prelude.startsWith("@property")) {
      // no selectors in here
    } else if (prelude.startsWith("@")) {
      out.push(...rules(inner));
    } else if (prelude) {
      out.push({ selector: prelude.replace(/^[;}\s]+/, ""), body: inner });
    }
    i = close + 1;
  }
  return out;
}

function matchingBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  return css.length;
}

/** A selector whose subject is not scoped by a class, id or attribute. */
function isGlobal(selector: string): boolean {
  const first = selector.split(/[\s>+~]/)[0] ?? "";
  if (/[.#[]/.test(first)) return false;
  return /^(:root|html|body|\*|::?[a-z-]+|[a-z][a-z0-9-]*)(?:[:(].*)?$/i.test(first);
}

const onlyTailwindVars = (body: string) =>
  body
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .every((d) => d.startsWith("--tw-"));
