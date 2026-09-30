import tailwind from "@tailwindcss/postcss";
import { scopeToRemote } from "./scripts/postcss-scope.mjs";

// Tailwind first, then every selector it produced gets confined to the
// remote's subtree. See scripts/postcss-scope.mjs for why.
export default { plugins: [tailwind(), scopeToRemote()] };
