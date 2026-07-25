# Cookie Consent Integration Checklist (Issue #131)

## Overview

This document provides QA steps to verify cookie consent functionality across all paths: accept, reject, and revoke.

**Storage Key:** `nw_cookie_consent` (centralized in `src/lib/storage-keys.ts`)

## Storage Contract

### Data Structure

```typescript
{
  status: "pending" | "accepted" | "rejected" | "custom",
  preferences: {
    necessary: true,      // always true
    analytics: boolean,
    marketing: boolean,
    personalization: boolean
  },
  lastUpdated: ISO string | null
}
```

### Storage Key Registry

All localStorage keys are now centralized in `src/lib/storage-keys.ts`:

```typescript
STORAGE_KEYS = {
  COOKIE_CONSENT: "nw_cookie_consent",
  THEME: "nw_theme",
  PREFERENCES: "nw_preferences",
  NOTIFICATIONS: "nw_notifications",
  SECURITY: "nw_security",
  PROFILE: "nw_profile",
  ONBOARDING_STATE: "nw_onboarding_state",
  SANDBOX_SCENARIOS: "nw_sandbox_scenarios",
  WALLET_CONNECTED: "nw_wallet_connected",
  WALLET_PUBLIC_KEY: "nw_wallet_public_key",
  WALLET_NETWORK: "nw_wallet_network",
  WALLET_PROVIDER: "nw_wallet_provider",
};
```

## QA Test Cases

### 1. Initial State (No Consent)

**Steps:**

1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Verify banner appears

**Expected:**

- Cookie banner visible at bottom
- Status: "pending"
- Storage: empty

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // null
```

---

### 2. Accept All Path

**Steps:**

1. Click "Accept all" button in banner
2. Verify banner disappears
3. Check storage

**Expected:**

- Banner hidden
- Status: "accepted"
- All preferences: true
- lastUpdated: current timestamp

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status); // "accepted"
console.log(consent.preferences); // { necessary: true, analytics: true, marketing: true, personalization: true }
```

---

### 3. Reject All Path

**Steps:**

1. Clear localStorage
2. Reload page
3. Click "Reject" button in banner
4. Verify banner disappears
5. Check storage

**Expected:**

- Banner hidden
- Status: "rejected"
- Only necessary: true, others: false
- lastUpdated: current timestamp

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status); // "rejected"
console.log(consent.preferences); // { necessary: true, analytics: false, marketing: false, personalization: false }
```

---

### 4. Custom Preferences Path

**Steps:**

1. Clear localStorage
2. Reload page
3. Click "Options" button in banner
4. Toggle analytics ON, marketing OFF, personalization ON
5. Click "Save preferences"
6. Verify banner disappears
7. Check storage

**Expected:**

- Banner hidden
- Status: "custom"
- Preferences: { necessary: true, analytics: true, marketing: false, personalization: true }
- lastUpdated: current timestamp

**Verification:**

```javascript
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.status); // "custom"
console.log(consent.preferences.analytics); // true
console.log(consent.preferences.marketing); // false
```

---

### 5. Revoke Consent Path

**Steps:**

1. Accept all cookies (from step 2)
2. Navigate to Settings → Privacy Preferences
3. Click "Reset" button
4. Verify banner reappears
5. Check storage

**Expected:**

- Banner visible again
- Storage cleared
- Status: "pending"

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // null
```

---

### 6. Settings Page Integration

**Steps:**

1. Accept all cookies
2. Navigate to Settings → Privacy Preferences
3. Verify current status displayed
4. Verify preferences shown correctly
5. Click "Manage preferences" → modify → save
6. Return to settings page
7. Verify updated preferences displayed

**Expected:**

- Status label matches storage
- Preferences match storage
- Changes persist across page reloads
- lastUpdated timestamp displayed

**Verification:**

```javascript
// After modifying preferences
const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
console.log(consent.lastUpdated); // recent timestamp
```

---

### 7. Modal Consistency

**Steps:**

1. Accept all cookies
2. Open banner → click "Options"
3. Verify modal shows current preferences
4. Modify one preference
5. Close modal without saving
6. Reopen modal
7. Verify preferences reverted to saved state

**Expected:**

- Modal reflects current storage state
- Unsaved changes don't persist
- Closing modal doesn't modify storage

---

### 8. Persistence Across Sessions

**Steps:**

1. Accept all cookies
2. Close browser tab
3. Reopen site
4. Verify banner NOT visible
5. Verify storage intact

**Expected:**

- Banner hidden (consent remembered)
- Storage unchanged
- Status: "accepted"

**Verification:**

```javascript
localStorage.getItem("nw_cookie_consent"); // contains previous consent
```

---

### 9. Storage Key Consistency

**Steps:**

1. Search codebase for localStorage references
2. Verify all use `STORAGE_KEYS.COOKIE_CONSENT`
3. Verify no hardcoded "nw_cookie_consent" strings

**Expected:**

- All references use centralized constant
- No duplicate storage keys
- Single source of truth

**Files to Check:**

- `src/contexts/CookieConsentContext.tsx`
- `src/components/cookie/CookieBanner.tsx`
- `src/components/cookie/PrivacyModal.tsx`
- `src/components/settings/CookieConsentSettings.tsx`

---

## Browser DevTools Verification

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Verify `nw_cookie_consent` key exists
4. Inspect JSON structure
5. Verify no other cookie-related keys

### Firefox Developer Tools

1. Open DevTools (F12)
2. Go to Storage → Local Storage
3. Verify `nw_cookie_consent` key exists
4. Inspect JSON structure

---

## Automated Test Template

```typescript
// Example test case (Node.js test module)
import { test } from "node:test";
import assert from "node:assert";

test("Cookie consent: accept all", () => {
  // Setup
  localStorage.clear();

  // Action
  acceptAllButton.click();

  // Verify
  const consent = JSON.parse(localStorage.getItem("nw_cookie_consent"));
  assert.strictEqual(consent.status, "accepted");
  assert.strictEqual(consent.preferences.analytics, true);
  assert.strictEqual(consent.preferences.marketing, true);
  assert.strictEqual(consent.preferences.personalization, true);
});
```

---

## Related Issues

- #131: Align cookie consent storage keys and settings page labels
- #422: Data viz: verify chart colors against design tokens and contrast for CVD
- #167: Document NEUROWEALTH_API contract (paths, auth, error JSON) for integration
