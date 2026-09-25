// Screengrabs for the this-site demo, one per theme. Imported rather than
// referenced by path so the bundler fingerprints them and the URLs point at
// this remote's origin, wherever the page that mounted it happens to live.

import designSystemDark from "./design-system.png";
import designSystemLight from "./design-system-light.png";
import fantasyDark from "./fantasy.png";
import fantasyLight from "./fantasy-light.png";
import operatorDark from "./operator.png";
import operatorLight from "./operator-light.png";
import pokemonDark from "./pokemon.png";
import pokemonLight from "./pokemon-light.png";
import thoughtsDark from "./thoughts.png";
import thoughtsLight from "./thoughts-light.png";
import updatesDark from "./updates.png";
import updatesLight from "./updates-light.png";
import vitalsDark from "./vitals.png";
import vitalsLight from "./vitals-light.png";
import worldDark from "./world.png";
import worldLight from "./world-light.png";
import zeroproofDark from "./zeroproof.png";
import zeroproofLight from "./zeroproof-light.png";

export const THUMBS = {
  "design-system": { dark: designSystemDark, light: designSystemLight },
  "fantasy": { dark: fantasyDark, light: fantasyLight },
  "operator": { dark: operatorDark, light: operatorLight },
  "pokemon": { dark: pokemonDark, light: pokemonLight },
  "thoughts": { dark: thoughtsDark, light: thoughtsLight },
  "updates": { dark: updatesDark, light: updatesLight },
  "vitals": { dark: vitalsDark, light: vitalsLight },
  "world": { dark: worldDark, light: worldLight },
  "zeroproof": { dark: zeroproofDark, light: zeroproofLight },
} as const;
