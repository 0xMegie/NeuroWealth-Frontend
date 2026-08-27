# Changelog

All notable changes to NeuroWealth Frontend are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are tagged in GitHub Releases and linked from this file.

---

## [Unreleased] — 2026-07-26

### Added
- Provider service layer, storage adapters, and onboarding hook refactor (#335, #337, #338, #339; #597)
- Global search and validation system with race-safety / no-results coverage (#520, #515, #365, #366)
- Shared form-field accessibility wiring and chart `aria-label` / `prefers-reduced-motion` support (#498, #594)
- Auth middleware, consolidated Tailwind token sources, and env-example hardening (#511, #510)
- Bundle analyzer support and major dashboard surface work (#497, #496)
- Comprehensive i18n test coverage and dashboard string migration (#584, #587)
- Test coverage for pagination, z-index scale, form field validation, and settings hooks (#667, #668, #670, #671)
- Role/notifications/diagnostics list migration (#701, #696, #698, #699; #762)
- Privacy settings page, cookie consent settings, and SandboxBadge component (#724, #752)
- Preview endpoint caching (#716; #753)

### Changed
- Consolidated `/signin` into `/login` as the canonical auth route (#381, #508)
- Performance pass: memoized Auth/Sandbox provider values, lazy-loaded GlobalSearch, shared formatters (#588, #589, #586)
- Unified seed strategy across mock services and chart data (#661)
- Aligned signup validation with shared helpers; standardized API validation errors to 400 (#658, #571)
- Unified route metadata and isolated dev-error routes from breadcrumbs (#659, #662)
- Settings theming cleanup and service-layer ID store strategy consistency (#693, #694, #695, #697; #759, #762)
- Client providers, navbar, transaction-flow, and auth-context refactor (#332, #333, #334, #336; #679)

### Fixed
- Accessibility hardening: modal/drawer focus traps, keyboard-operable controls, navbar touch targets, Switch focus-visible ring (#595, #660, #585, #663)
- Deposit/withdraw `aria-invalid` / `aria-describedby`, notification keyboard semantics, portfolio breakpoint alignment (#594, #523, #564)
- Fetch recovery UX, logger/PII hardening, and API timeout documentation (#389, #390, #357–#360)
- Storage key / sandbox scenario sharing and frontend persistence cleanup (#341–#344, #513)
- CI typecheck/test/lint gate stability (including Next 14 `.eslintrc.json` for `next lint`) (#592, #593)
- Error boundary focus target collision and wallet state a11y (#615, #617; #746, #747)
- Security and E2E issues (#622, #625; #680)
- Transaction stages a11y (#616; #681)
- Switch focus-visible ring (#663)
- Round 3 audit fixes (#684, #687; #757)
- Settings/storage error logging (#755)

### Removed
- Orphaned service layer module (#727; #749)
- Unused CVD chart-color exports (#725; #751)
- Dead `next/script` import and stale DB/WALLET_ENCRYPTION_KEY secrets (#717; #672)

### Security
- Continued dependency and audit hygiene tracked under `docs/security/` (see npm audit policy reviews)
- Auth security docs and demo-seed audit fixes (#666, #672)
- Audit issues remediation (#539, #581, #582, #583; #669, #664)
- Audit docs and demo issues (#666)

### Process
- Release notes remain manual Keep-a-Changelog entries under `[Unreleased]`.
- Automation (release-please / Changesets) is still deferred: volume of merged work since 2026-06-24 makes periodic manual sweeps necessary until a release tooling decision is made.
- Each PR that ships user-visible changes should add an entry here; maintainers fold `[Unreleased]` into a versioned section on release.

---

## [Unreleased] — 2026-06-24

### Added
- Folder structure documentation in `README.md` covering all top-level `src/` directories (closes #428)

### Documented
- Release notes process confirmed as manual Keep-a-Changelog; no Changesets automation required at this stage (closes #427)
- Authenticated dashboard shell verified: protected route, responsive layout (sidebar + top header / mobile bottom nav), skeleton loading states, and error boundary all in place (closes #429)
- Error pages verified: 401, 403, 404, and 500 pages implemented with recovery actions; dev-only mock triggers available at `/dashboard/dev-errors` (closes #449)

---

## [Unreleased] — 2026-04-26

### Added
- `CHANGELOG.md` with initial dated section and release notes process (closes #168)
- `.lintstagedrc` for optional pre-commit lint-staged setup (closes #166)
- Body size limit (100 kb) and JSON parse error handling on all POST API routes (closes #165)
- `env(safe-area-inset-bottom)` padding on `MobileBottomNav` and fixed CTAs for notched devices (closes #164)

### Process
Release notes are maintained manually in this file by the PR author.
Each PR that ships user-visible changes must add an entry under `[Unreleased]`.
On release, the maintainer renames `[Unreleased]` to the version + date and opens a GitHub Release linking back here.

No automation (Changesets, semantic-release) is required at this stage.
If the team later adopts Changesets, this file becomes the generated output target.
