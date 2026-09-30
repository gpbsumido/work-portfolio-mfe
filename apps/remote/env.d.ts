/// <reference types="@rsbuild/core/types" />

/** Injected at build time from this package's version, shown on the host's provenance chip. */
declare const __REMOTE_VERSION__: string;

interface ImportMetaEnv {
  readonly PUBLIC_WALLETCONNECT_PROJECT_ID?: string;
}
