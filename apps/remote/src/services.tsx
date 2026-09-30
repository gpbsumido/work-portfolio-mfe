import { createContext, useContext, type ReactNode } from "react";
import type { HostServices } from "@paul-portfolio/work-portfolio-contract";

const HostServicesContext = createContext<HostServices | null>(null);

/** Makes the host's services reachable from any demo under the mount root. */
export function HostServicesProvider({
  services,
  children,
}: {
  services: HostServices;
  children: ReactNode;
}) {
  return (
    <HostServicesContext.Provider value={services}>
      {children}
    </HostServicesContext.Provider>
  );
}

/** The services the host lent this mount. Throws outside a mount, which is always a wiring bug. */
export function useHostServices(): HostServices {
  const services = useContext(HostServicesContext);
  if (!services) {
    throw new Error("useHostServices needs a HostServicesProvider above it");
  }
  return services;
}
