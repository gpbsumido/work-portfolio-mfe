/**
 * Data model for the work-portfolio page. One catalog drives both tickers,
 * the demo stage, the explainer windows, and deep links.
 *
 * The shapes live in the contract package now, because the host reads the
 * same catalog (as catalog.json) and both sides have to agree on it.
 */
export type {
  AccentTheme,
  WorkProject,
  WorkFeature,
} from "@paul-portfolio/work-portfolio-contract";
