import { type ComponentType, type ReactNode } from "react";

type ProviderComponent =
  | ComponentType<{ children: ReactNode }>
  | [ComponentType<{ children: ReactNode } & Record<string, unknown>>, Record<string, unknown>];

/**
 * Composes an array of providers into a single wrapper, eliminating deep nesting.
 *
 * Usage:
 * ```tsx
 * const AllProviders = composeProviders([
 *   ThemeProvider,
 *   [WalletProvider, { network, horizonUrl }],
 *   ToastProvider,
 * ]);
 *
 * return <AllProviders>{children}</AllProviders>;
 * ```
 */
export function composeProviders(providers: ProviderComponent[]) {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight<ReactNode>((acc, entry) => {
      if (Array.isArray(entry)) {
        const [Provider, props] = entry;
        return <Provider {...props}>{acc}</Provider>;
      }
      const Provider = entry;
      return <Provider>{acc}</Provider>;
    }, children);
  };
}
