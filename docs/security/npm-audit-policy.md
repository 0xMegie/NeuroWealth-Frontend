# npm audit triage policy for Stellar and wallet dependencies

## Snapshot

- Reviewed on: `2026-06-24`
- Command: `npm audit --json`
- Summary: `2 critical`, `13 high`, `10 moderate`, `17 low` (42 total)
- Direct-dependency risk is concentrated in `@creit.tech/stellar-wallets-kit@1.8.x` and its transitive wallet tree.
- No separate `@walletconnect/*` advisories appeared in this snapshot; the wallet findings come from sibling transitive packages (`@solana/web3.js`, `@near-js/crypto`, `@trezor/*`) pulled in by the same SDK tree.

## Policy

- Do not run `npm audit fix --force` or any equivalent breaking upgrade without maintainer sign-off.
- Treat direct dependencies with patched releases as `must-fix`, especially framework and auth-routing packages.
- Treat transitive wallet findings as one of: `must-fix now`, `accepted temporary risk`, or `monitor only`. Every accepted risk needs a reason and a review date.
- Prefer this order of remediation:
  1. Patch or minor upgrade the direct dependency.
  2. Add a targeted `overrides` entry only after build, typecheck, tests, and wallet smoke checks pass.
  3. If no safe override exists, open or link an upstream issue and schedule a review instead of forcing the tree.

## Current decisions

| Package path | Severity | Decision | Reason | Next action |
| --- | --- | --- | --- | --- |
| `@creit.tech/stellar-wallets-kit@1.8.x` (direct) | `high` (rolled up) | `must-fix` | Direct dependency; audit reports a fix available at `1.5.0` (semver-major). Fix requires a breaking-change upgrade and wallet smoke-test pass. | Open follow-up PR to upgrade to the latest stable `1.x` line or evaluate `1.5.0`; run wallet connect, deposit, and withdrawal smoke tests after. |
| `secp256k1` via `@near-js/crypto` → `@hot-wallet/sdk` → `@creit.tech/stellar-wallets-kit` | `critical` | `accepted temporary risk` | The advisory requires an attacker to supply crafted key material that the app itself never generates from untrusted input. The Stellar-SDK path is read-only for the current demo scope. | Track upstream `@creit.tech` releases for a patched transitive tree. Re-evaluate within 7 days or on next wallet SDK update. |
| `@trezor/connect` chain via `@creit.tech/stellar-wallets-kit` | `critical` | `accepted temporary risk` | Trezor hardware integration is not wired up in the current Stellar flow. The critical path is not reachable in production. | Keep wallet scope limited. Ask upstream for a patched tree or restrict `@trezor/*` via overrides once a safe version is confirmed. |
| `@solana/web3.js` via `@hot-wallet/sdk` → `@creit.tech/stellar-wallets-kit` | `high` | `accepted temporary risk` | The Solana chain is not in the active integration surface. The finding sits several layers from any invoked code path. | Recheck on next wallet SDK bump. Prefer upstream refresh over a forced override. |
| `jayson` via `@solana/web3.js` | `high` | `accepted temporary risk` | Same transitive chain as `@solana/web3.js`. Not called by application code. | Resolved automatically if `@solana/web3.js` is patched upstream. |
| `uuid < 11.1.1` via `jayson` and `rpc-websockets` | `moderate` | `accepted temporary risk` | Buffer-bounds issue in v3/v5/v6 only when an optional `buf` argument is provided. Application code does not call uuid directly; exposure is inside transitive SDK internals. | Fix available via `npm audit fix --force` (requires major wallet-kit bump). Schedule with the `@creit.tech` upgrade PR. |
| `ua-parser-js 2.0.1–2.0.9` | `moderate` | `monitor only` | UAParser ReDoS via `withClientHints()`. This app does not parse UA strings server-side. Fix is available via `npm audit fix` (non-breaking). | Run `npm audit fix` on the next routine dependency maintenance PR to clear this without affecting the wallet tree. |
| `@near-js/*` chain (accounts, keystores, providers, signers, transactions, wallet-account) | `low` | `monitor only` | All findings trace back to the same `secp256k1`/`@near-js/crypto` root. NEAR chain is not an active integration target. | Resolved automatically if `@creit.tech/stellar-wallets-kit` drops `@hot-wallet/sdk` in a future release. |
| `elliptic` via wallet tree | `low` | `monitor only` | No patched version recommendation from upstream. Forcing replacements is higher risk than the reported low-severity issue. | Track upstream maintainer guidance and rerun audit on each wallet SDK update. |

## Review cadence

- Re-run `npm audit --json` on every dependency upgrade PR that touches `next`, wallet SDKs, or auth/middleware code.
- Re-review `critical` and `high` accepted wallet risks within **7 days** while `@creit.tech/stellar-wallets-kit` remains in use.
- Run a full audit at least **monthly** until all critical and high findings are cleared.
- Clear the `ua-parser-js` moderate finding with `npm audit fix` on the next routine maintenance PR.

## PR QA checklist for dependency triage changes

- `yarn typecheck`
- `yarn test`
- `yarn build`
- Smoke test `/login`, `/dashboard`, `/dashboard/settings/security`, and wallet-connect entry points after any dependency upgrade
