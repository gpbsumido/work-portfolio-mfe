"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";

/**
 * Wallet-connect provider for the nft-inventory demo. Wraps it in wagmi +
 * RainbowKit so it can read the connected account and show a connect button.
 *
 * The remote owns its own copy rather than borrowing the host's, and it only
 * loads inside that demo's chunk. Sits inside the mount's QueryClientProvider
 * (wagmi uses TanStack Query) and follows the host page's data-theme, so the
 * RainbowKit modal matches its light/dark theme.
 */
export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useDocumentTheme();
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={theme === "dark" ? darkTheme() : lightTheme()}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
