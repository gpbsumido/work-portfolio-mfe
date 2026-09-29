/**
 * The class every piece of remote UI sits under. The remote's CSS only matches
 * inside it (scripts/postcss-scope.mjs), so anything rendered outside the
 * mount root, like a modal portaled to <body>, has to carry it too.
 */
export const REMOTE_SCOPE = "work-portfolio-mfe";
