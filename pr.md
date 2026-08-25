## Summary

Resolves four linked issues in a single branch: onboarding flow, responsive nav, async state system, and performance optimisation pass.

## Changes

**#440 — Onboarding flow (first-time users)**
- `/onboarding` page renders `OnboardingFlow` and redirects to dashboard on complete/skip
- `OnboardingGate` wraps the dashboard page — first-time users (no localStorage state) see the 3-step flow inline before the dashboard renders
- Completion state persisted via existing `onboarding-state.ts` / `STORAGE_KEYS.ONBOARDING_STATE`
- `OnboardingSettings` card surfaced in `/dashboard/settings` so users can review or reset onboarding at any time
- Steps: Wallet Connect → Strategy Overview → First Deposit, each with primary action + skip

**#454 — Responsive navigation**
- Fixed `TopHeader` left-offset breakpoints: was `md:left-64` (skipped tablet rail), now `sm:left-14 lg:left-64` — matches sidebar layout at all three breakpoints (mobile / tablet rail 56px / desktop 256px)
- Sidebar: icon-only rail at 640–1023 px, expands on toggle; full at ≥ 1024 px; hidden on mobile
- `MobileBottomNav`: fixed bottom bar below 640 px, 44 px touch targets, `aria-current="page"` on active item
- All nav items meet 44 px min touch target; pointer targets 36 px min on toggle button

**#441 — Global async state system**
- `ErrorBlock`, `EmptyState`, `DataBoundary`, `useAsyncData`, `useAsyncState` — fully wired across portfolio, strategy, transaction, history, and audit pages
- Skeleton presets (`DashboardSkeleton`, `TableSkeleton`, `TransactionFormSkeleton`, etc.) match final layout dimensions
- Every error state includes title, description, and retry action
- `/dashboard/async-states` dev page demonstrates all loading/empty/error flows

**#443 — Performance optimisation**
- `next.config.mjs`: gzip compression, AVIF/WebP images, `removeConsole` in production, `optimizePackageImports` for `lucide-react`
- `@next/bundle-analyzer` wired via `yarn analyze` (`ANALYZE=true`)
- Route-level code splitting via Next.js App Router + `Suspense` boundaries on every dashboard route
- Skeletons used on all async-heavy sections — no layout shift during load

## Checks

- `npx tsc --noEmit` — 9 pre-existing errors in demo/test/chart files, none introduced by this PR
- `npx next lint` — ✔ no warnings or errors

Closes #440
Closes #454
Closes #441
Closes #443
