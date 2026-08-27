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
Round-3 cleanup pass: removes dead code shipped from a completed-but-unwired
dashboard refactor, a leftover pre-recharts helper, an unused devDependency,
and an unused mock chart dataset that ran eagerly at import time.

- `AllocationSection`, `ActivitySection`, and `SummarySection` were split out
  of `PortfolioDashboard` in a prior refactor but never adopted — the parent
  still renders the panels inline via i18n-driven JSX, so the extracted
  components (and their matching `AllocationWidgetSkeleton`) were unused. They
  hardcode English copy instead of pulling from `useI18n`/`AppMessages`, so
  wiring them in as-is would have silently dropped translations. Deleted
  rather than migrated to avoid that regression.
- `buildDonutBackground()` in `PortfolioDashboard.tsx` was leftover from
  before the manual CSS conic-gradient donut was replaced by
  `AllocationChart`/recharts, and was never called.
- `vitest` was listed as a devDependency but never configured or imported;
  the test runner is Node's built-in test runner via `tsx`, matching
  README/CONTRIBUTING.
- `multiLineData` / `generateMultiLineData()` in `mock-chart-data.ts` was
  exported but never imported by the charts docs page (unlike its siblings),
  and ran eagerly at module-import time on every import of the module.

## Changes

- `src/components/dashboard/PortfolioDashboard.tsx` — remove dead
  `buildDonutBackground()`
- `src/components/dashboard/AllocationSection.tsx`,
  `ActivitySection.tsx`, `SummarySection.tsx` — deleted (unused)
- `src/components/ui/Skeleton.tsx` — remove unused
  `AllocationWidgetSkeleton` preset
- `package.json` / `yarn.lock` — remove unused `vitest` devDependency
- `src/lib/mock-chart-data.ts` — remove unused `multiLineData`,
  `generateMultiLineData()`, and the now-orphaned
  `BenchmarkComparisonPoint` type
- `src/lib/mock-chart-data.test.ts` — remove the corresponding
  `generateMultiLineData()` test block

## QA

- `yarn install` — clean
- `yarn typecheck` — no new errors (one pre-existing failure in
  `src/useDateFilterMock.ts`, confirmed present on `main` before this branch
  via `git stash` diff)
- `yarn test` — 15 pre-existing failures, identical count with and without
  this branch's changes (confirmed via `git stash` diff);
  `mock-chart-data.test.ts` passes cleanly on its own
- `yarn lint` — no new errors (2 pre-existing errors in `AuditTrail.tsx` and
  `composeProviders.tsx`, neither touched here)

No new duplicate abstractions were introduced — this is a pure removal of
unreferenced code.

## Issues

closes #722
closes #723
closes #719
closes #726
