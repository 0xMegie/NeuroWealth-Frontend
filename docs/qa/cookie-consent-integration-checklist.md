# Cookie Consent Integration Checklist

This document verifies the end-to-end functionality of the cookie consent flow, ensuring that all components (Banner, Modal, Settings) share a unified namespaced storage contract (\`nw_cookie_consent\`) and that the UI state correctly mirrors the stored preferences.

## Pre-requisites
- Open browser DevTools -> Application -> Local Storage.
- Clear any existing \`nw_cookie_consent\` key.
- Refresh the page.

## 1. User Accepts Cookies
- [ ] Observe that the Cookie Banner is visible at the bottom of the screen.
- [ ] Click **"Accept All"** on the Cookie Banner.
- [ ] Verify the banner disappears.
- [ ] Check Local Storage:
  - Key \`nw_cookie_consent\` should exist.
  - The value should be a JSON object with \`status: "accepted"\` and all preferences (\`necessary\`, \`analytics\`, \`marketing\`, \`personalization\`) set to \`true\`.
- [ ] Navigate to **Settings > Cookie & Privacy Preferences**.
- [ ] Verify the status label reads: **"All cookies accepted"** (with green accent).
- [ ] Verify all toggle indicators read **"On"**.

## 2. User Rejects Cookies
- [ ] Clear the \`nw_cookie_consent\` key from Local Storage and refresh the page.
- [ ] Click **"Reject All"** on the Cookie Banner.
- [ ] Verify the banner disappears.
- [ ] Check Local Storage:
  - Key \`nw_cookie_consent\` should exist.
  - The value should be a JSON object with \`status: "rejected"\`.
  - Preference \`necessary\` should be \`true\`, and all others \`false\`.
- [ ] Navigate to **Settings > Cookie & Privacy Preferences**.
- [ ] Verify the status label reads: **"Non-essential cookies rejected"** (with red accent).
- [ ] Verify only "Strictly Necessary" reads **"On"**, while others read **"Off"**.

## 3. User Revokes/Resets Consent
- [ ] From **Settings > Cookie & Privacy Preferences**, click the **"Reset"** button.
- [ ] Verify the Cookie Banner reappears immediately at the bottom of the screen.
- [ ] Check Local Storage:
  - Key \`nw_cookie_consent\` should no longer exist.
- [ ] Verify the status label in Settings reads: **"No preference set"**.
- [ ] Verify all toggles except "Strictly Necessary" read **"Off"**.

## 4. Custom Preferences
- [ ] From the Cookie Banner or Settings, click **"Manage preferences"**.
- [ ] In the Privacy Modal, toggle **Analytics** to "On", leave others "Off".
- [ ] Click **"Save Preferences"**.
- [ ] Check Local Storage:
  - Key \`nw_cookie_consent\` should exist.
  - The value should be a JSON object with \`status: "custom"\`.
  - Preferences should show \`necessary: true\`, \`analytics: true\`, and others \`false\`.
- [ ] Navigate to **Settings**.
- [ ] Verify the status label reads: **"Custom preferences saved"** (with amber accent).

## 5. Consent State Persists After Reload
- [ ] Set any preference (Accept, Reject, or Custom).
- [ ] Hard refresh the page (Cmd/Ctrl + Shift + R).
- [ ] Verify the Cookie Banner does **not** appear.
- [ ] Navigate to **Settings > Cookie & Privacy Preferences**.
- [ ] Verify the previously selected state and labels are perfectly restored and match Local Storage.
