"use client";
import { ReactNode } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { AuthProvider } from "@/contexts";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const WalletProvider = dynamic(
  () => import("@/contexts/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);
import { I18nProvider } from "@/contexts/I18nContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieBanner, PrivacyModal } from "@/components/cookie";
import { composeProviders } from "@/lib/composeProviders";
import { useErrorTracking } from "@/hooks/useErrorTracking";

/** Mounts global error tracking (window error + unhandledrejection → logger). */
function ErrorTrackingMount() {
  useErrorTracking();
  return null;
}

function resolveStellarConfig() {
  const rawNetwork = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
  const isMainnet = rawNetwork === "mainnet" || rawNetwork === "public";
  const network = isMainnet ? Networks.PUBLIC : Networks.TESTNET;
  const fallbackHorizonUrl = isMainnet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

  return {
    network,
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || fallbackHorizonUrl,
  };
}

// Hoisted to module scope so provider component identity stays stable across
// ClientProviders re-renders. Calling composeProviders() inside the component
// body created a new component type every render and remounted the whole tree.
const stellarConfig = resolveStellarConfig();

const Providers = composeProviders([
  SandboxProvider,
  ThemeProvider,
  I18nProvider,
  AuthProvider,
  ToastProvider,
  CookieConsentProvider,
]);

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWalletPossible = pathname?.startsWith("/dashboard") || pathname?.startsWith("/profile");

  return (
    <Providers>
      <ErrorTrackingMount />
      {isWalletPossible ? (
        <WalletProvider network={stellarConfig.network} horizonUrl={stellarConfig.horizonUrl}>
          {children}
        </WalletProvider>
      ) : (
        children
      )}
      <CookieBanner />
      <PrivacyModal />
    </Providers>
  );
}
