/**
 * Confines the remote's CSS to the remote.
 *
 * The remote and the host both use Tailwind, so they share class names. The
 * remote's stylesheet loads after the host's and lands in the same cascade
 * layer, so without this its `.hidden` beat the host's `sm:inline-flex` on a
 * host element (the header chip) and hid it. Class-name collisions between
 * two independently built bundles are the classic micro-frontend CSS bug.
 *
 * Every selector gets `:where(.work-portfolio-mfe, .work-portfolio-mfe *)`
 * appended: it only matches inside an element carrying that class (the mount
 * root, or a portaled modal that opts in), and :where() adds no specificity,
 * so inside the remote the cascade behaves exactly as before.
 */

export const REMOTE_SCOPE = "work-portfolio-mfe";

const WHERE = `:where(.${REMOTE_SCOPE}, .${REMOTE_SCOPE} *)`;

// A trailing pseudo-element, which has to stay last in a compound selector.
const PSEUDO_ELEMENT =
  /(::[a-z-]+(?:\([^)]*\))?|:(?:before|after|first-line|first-letter))$/i;

/** Splits on top-level commas only, leaving :is(a, b) and friends intact. */
function splitList(selector) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** @param {string} selector */
export function scopeSelector(selector) {
  return splitList(selector)
    .map((one) => {
      const pseudo = one.match(PSEUDO_ELEMENT);
      return pseudo
        ? `${one.slice(0, -pseudo[0].length)}${WHERE}${pseudo[0]}`
        : `${one}${WHERE}`;
    })
    .join(", ");
}

const onlyTailwindVars = (rule) =>
  rule.nodes.length > 0 &&
  rule.nodes.every((n) => n.type === "decl" && n.prop.startsWith("--tw-"));

const inKeyframes = (rule) => {
  for (let p = rule.parent; p; p = p.parent) {
    if (p.type === "atrule" && /keyframes$/i.test(p.name)) return true;
  }
  return false;
};

/** PostCSS plugin; runs after Tailwind in postcss.config.mjs. */
export function scopeToRemote() {
  return {
    postcssPlugin: "work-portfolio-scope",
    OnceExit(root) {
      root.walkRules((rule) => {
        if (inKeyframes(rule) || onlyTailwindVars(rule)) return;
        if (rule.selector.includes(WHERE)) return;
        rule.selector = scopeSelector(rule.selector);
      });
    },
  };
}
scopeToRemote.postcss = true;
