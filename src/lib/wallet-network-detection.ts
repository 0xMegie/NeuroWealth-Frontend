import { getNetwork as getFreighterNetwork } from "@stellar/freighter-api";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";
import {
  formatConfiguredNetworkLabel,
  getConfiguredNetworkPassphrase,
  networkPassphrasesMatch,
} from "@/lib/stellar-network";

export interface WalletNetworkStatus {
  hasMismatch: boolean;
  appNetworkLabel: string;
  walletNetworkLabel?: string;
  walletPassphrase?: string;
}

async function detectFreighterPassphrase(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;

  try {
    const { networkPassphrase, error } = await getFreighterNetwork();
    if (error || !networkPassphrase) return undefined;
    return networkPassphrase;
  } catch {
    return undefined;
  }
}

function labelFromPassphrase(passphrase: string): string {
  const lower = passphrase.toLowerCase();
  if (lower.includes("test")) return "TESTNET";
  if (lower.includes("public") || lower.includes("main")) return "PUBLIC";
  return "UNKNOWN";
}

/**
 * Compares the wallet extension network (when available) to NEXT_PUBLIC_STELLAR_NETWORK.
 */
export async function detectWalletNetworkMismatch(
  walletProviderId?: string,
): Promise<WalletNetworkStatus> {
  const expectedPassphrase = getConfiguredNetworkPassphrase();
  const appNetworkLabel = formatConfiguredNetworkLabel();

  if (!walletProviderId || walletProviderId !== FREIGHTER_ID) {
    return {
      hasMismatch: false,
      appNetworkLabel,
    };
  }

  const walletPassphrase = await detectFreighterPassphrase();
  if (!walletPassphrase) {
    return {
      hasMismatch: false,
      appNetworkLabel,
    };
  }

  const hasMismatch = !networkPassphrasesMatch(
    expectedPassphrase,
    walletPassphrase,
  );

  return {
    hasMismatch,
    appNetworkLabel,
    walletNetworkLabel: labelFromPassphrase(walletPassphrase),
    walletPassphrase,
  };
}
