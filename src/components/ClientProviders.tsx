"use client";
import { ReactNode } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { AuthProvider, WalletProvider } from "@/contexts";
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

export function ClientProviders({ children }: { children: ReactNode }) {
  const { network, horizonUrl } = resolveStellarConfig();

  const Providers = composeProviders([
    SandboxProvider,
    ThemeProvider,
    I18nProvider,
    AuthProvider,
    [WalletProvider, { network, horizonUrl }],
    ToastProvider,
    CookieConsentProvider,
  ]);

  return (
    <Providers>
      <ErrorTrackingMount />
      {children}
      <CookieBanner />
      <PrivacyModal />
    </Providers>
  );
}
