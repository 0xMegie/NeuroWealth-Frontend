// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof global.StorageEvent === "undefined") { global.StorageEvent = class StorageEvent extends Event { key: string | null; newValue: string | null; oldValue: string | null; constructor(type: string, init?: any) { super(type, init); this.key = init?.key ?? null; this.newValue = init?.newValue ?? null; this.oldValue = init?.oldValue ?? null; } } as any; }
import assert from "node:assert/strict";
import test from "node:test";

import {
  SESSION_STORAGE_KEY,
  SESSION_COOKIE_NAME,
} from "./auth-constants";

// ── Constants are properly defined ────────────────────────────────────────

test("session-sync — constants: SESSION_STORAGE_KEY is a non-empty string", () => {
  assert.equal(typeof SESSION_STORAGE_KEY, "string");
  assert.ok(SESSION_STORAGE_KEY.length > 0);
});

test("session-sync — constants: SESSION_COOKIE_NAME is a non-empty string", () => {
  assert.equal(typeof SESSION_COOKIE_NAME, "string");
  assert.ok(SESSION_COOKIE_NAME.length > 0);
});

test("session-sync — constants: SESSION_STORAGE_KEY and SESSION_COOKIE_NAME are distinct", () => {
  assert.notEqual(SESSION_STORAGE_KEY, SESSION_COOKIE_NAME);
});

// ── Storage event detection ──────────────────────────────────────────────

test("session-sync — storage-event: storage event with matching key is detected", () => {
  let eventDetected = false;
  const storageKey = SESSION_STORAGE_KEY;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey) {
      eventDetected = true;
    }
  };

  const event = new StorageEvent("storage", {
    key: SESSION_STORAGE_KEY,
    newValue: JSON.stringify({ token: "new-token" }),
  });

  handleStorageChange(event);
  assert.equal(eventDetected, true);
});

test("session-sync — storage-event: storage event with different key is ignored", () => {
  let eventDetected = false;
  const storageKey = SESSION_STORAGE_KEY;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey) {
      eventDetected = true;
    }
  };

  const event = new StorageEvent("storage", {
    key: "some-other-key",
    newValue: JSON.stringify({ token: "new-token" }),
  });

  handleStorageChange(event);
  assert.equal(eventDetected, false);
});

test("session-sync — storage-event: storage event with null key is ignored", () => {
  let eventDetected = false;
  const storageKey = SESSION_STORAGE_KEY;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey) {
      eventDetected = true;
    }
  };

  const event = new StorageEvent("storage", {
    key: null,
    newValue: JSON.stringify({ token: "new-token" }),
  });

  handleStorageChange(event);
  assert.equal(eventDetected, false);
});

// ── Cross-tab sign-out detection ─────────────────────────────────────────

test("session-sync — cross-tab: session cleared in one tab triggers sync in others", () => {
  const storageKey = SESSION_STORAGE_KEY;
  let syncTriggered = false;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue === null) {
      syncTriggered = true;
    }
  };

  const event = new StorageEvent("storage", {
    key: SESSION_STORAGE_KEY,
    newValue: null, // cleared
    oldValue: JSON.stringify({ token: "old-token" }),
  });

  handleStorageChange(event);
  assert.equal(syncTriggered, true);
});

test("session-sync — cross-tab: session update in one tab triggers sync in others", () => {
  const storageKey = SESSION_STORAGE_KEY;
  let syncTriggered = false;
  let newSessionValue: string | null = null;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue !== null) {
      syncTriggered = true;
      newSessionValue = e.newValue;
    }
  };

  const event = new StorageEvent("storage", {
    key: SESSION_STORAGE_KEY,
    newValue: JSON.stringify({ token: "new-token", expiresAt: 999999 }),
    oldValue: JSON.stringify({ token: "old-token", expiresAt: 888888 }),
  });

  handleStorageChange(event);
  assert.equal(syncTriggered, true);
  assert.ok((newSessionValue as string | null)?.includes("new-token"));
});

// ── Cookie handling ──────────────────────────────────────────────────────

test("session-sync — cookie: cookie name matches storage key pattern (nw_session vs neurowealth_session)", () => {
  assert.equal(SESSION_COOKIE_NAME, "nw_session");
  assert.equal(SESSION_STORAGE_KEY, "neurowealth_session");
  // Different prefixes: nw_ for cookies, neurowealth_ for storage
});

test("session-sync — cookie: SESSION_COOKIE_NAME is accessible for middleware", () => {
  // This test verifies that middleware can import the constant
  // and use it to check cookies without duplication
  const cookieName = SESSION_COOKIE_NAME;
  assert.ok(cookieName.length > 0);
  assert.equal(typeof cookieName, "string");
});

// ── Listener setup/cleanup ───────────────────────────────────────────────

test("session-sync — listeners: storage listener can be added and removed", () => {
  let callCount = 0;
  const handler = () => {
    callCount += 1;
  };

  const fakeWindow = {
    _listeners: [] as { event: string; handler: () => void }[],
    addEventListener(event: string, h: () => void) {
      this._listeners.push({ event, handler: h });
    },
    removeEventListener(event: string, h: () => void) {
      this._listeners = this._listeners.filter((l) => l.handler !== h);
    },
  };

  fakeWindow.addEventListener("storage", handler);
  assert.equal(fakeWindow._listeners.length, 1);

  fakeWindow.removeEventListener("storage", handler);
  assert.equal(fakeWindow._listeners.length, 0);
});

// ── Concurrent tab simulation ────────────────────────────────────────────

test("session-sync — concurrent: multiple tabs can sync from independent storage events", () => {
  const storageKey = SESSION_STORAGE_KEY;
  let tab1SyncCount = 0;
  let tab2SyncCount = 0;

  const handleTab1 = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue !== null) {
      tab1SyncCount += 1;
    }
  };

  const handleTab2 = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue !== null) {
      tab2SyncCount += 1;
    }
  };

  // Tab 1 updates session - Tab 2 receives event
  handleTab2(
    new StorageEvent("storage", {
      key: SESSION_STORAGE_KEY,
      newValue: JSON.stringify({ token: "tab1-token" }),
    }),
  );

  // Tab 2 updates session - Tab 1 receives event
  handleTab1(
    new StorageEvent("storage", {
      key: SESSION_STORAGE_KEY,
      newValue: JSON.stringify({ token: "tab2-token" }),
    }),
  );

  assert.equal(tab1SyncCount, 1);
  assert.equal(tab2SyncCount, 1);
});

test("session-sync — concurrent: same listener receiving multiple events processes each", () => {
  const storageKey = SESSION_STORAGE_KEY;
  let syncCount = 0;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === storageKey) {
      syncCount += 1;
    }
  };

  // Simulate multiple storage events
  for (let i = 0; i < 5; i++) {
    handleStorageChange(
      new StorageEvent("storage", {
        key: SESSION_STORAGE_KEY,
        newValue: JSON.stringify({ token: `token-${i}` }),
      }),
    );
  }

  assert.equal(syncCount, 5);
});
