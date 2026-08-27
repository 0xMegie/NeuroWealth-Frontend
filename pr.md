## Summary

Fixes four issues: cookie-consent shape validation, PortfolioDashboard error logging, and adds missing a11y/responsive/keyboard tests.

## Changes

**#794 — Audit: reopen and fix issues mis-closed by PR #755**

- **#689 — CookieConsentContext shape validation**: Added `isValidConsentState()` that validates `status` is one of `pending|accepted|rejected|custom`, `lastUpdated` is `string|null`, and all four `preferences` booleans are present. Invalid stored data is now logged, cleared from localStorage, and the banner is re-shown instead of trusting a corrupt shape.
- **#690 — PortfolioDashboard logger.error**: The catch block in `loadPortfolio()` now calls `logger.error("portfolio_fetch_failed", loadError)` before setting the error state, routing failures through the centralized logger.

**#790 — WalletConnectionStates aria-live tests**
- Added `WalletConnectionStates.test.ts` asserting all three connection states (restoring/connected/disconnected) have `role="status"` and `aria-live="polite"`, plus `data-qa` selectors per state.

**#789 — DiagnosticsPanelContent responsive-layout test**
- Added `DiagnosticsPanelContent.test.ts` locking in the fixed `w-[400px]` width class, `h-[500px]` height, fixed bottom-right positioning, and verifying the width is not viewport-relative (no `vw`/`min()`/`max()` units).

**#788 — FirstDepositStep keyboard-operability test**
- Added `FirstDepositStep.test.ts` simulating Enter and Space keydown on asset cards, asserting selection fires and `preventDefault` is called (stops page scroll). Also verifies other keys (Tab, Escape) don't trigger selection, and that cards have `tabIndex=0` and `role="button"`.

## Checks

- `npx tsc --noEmit` — pre-existing errors only, none introduced by this PR
- `npx next lint` — no warnings or errors

Closes #794
Closes #790
Closes #789
Closes #788
