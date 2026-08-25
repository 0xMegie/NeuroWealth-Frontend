import assert from "node:assert/strict";
import test from "node:test";
import { generateToken, normalizeSession, mockAuth } from "./mock-auth";

test("generateToken — generates token starting with mock_token_ when crypto.randomUUID is present", () => {
  const token = generateToken();
  assert.equal(typeof token, "string");
  assert.ok(token.startsWith("mock_token_"));
  assert.ok(token.length > 20);
});

test("generateToken — throws error when crypto.randomUUID is unavailable", () => {
  const originalCrypto = globalThis.crypto;
  try {
    // Temporarily substitute crypto object without randomUUID
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      writable: true,
      configurable: true,
    });
    assert.throws(
      () => generateToken(),
      /crypto\.randomUUID is not available in this environment/,
    );
  } finally {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  }
});

test("normalizeSession — returns null for invalid, non-object, or missing candidates", () => {
  assert.equal(normalizeSession(null), null);
  assert.equal(normalizeSession(undefined), null);
  assert.equal(normalizeSession("string"), null);
  assert.equal(normalizeSession(123), null);
  assert.equal(normalizeSession({}), null);
  assert.equal(normalizeSession({ token: "tok" }), null);
  assert.equal(normalizeSession({ expiresAt: Date.now() + 1000 }), null);
  assert.equal(
    normalizeSession({ token: 123, expiresAt: Date.now() + 1000, user: {} }),
    null,
  );
  assert.equal(
    normalizeSession({
      token: "tok",
      expiresAt: "invalid",
      user: { id: "u1", displayName: "Name" },
    }),
    null,
  );
  assert.equal(
    normalizeSession({
      token: "tok",
      expiresAt: Date.now() + 1000,
      user: { id: "u1" }, // missing displayName
    }),
    null,
  );
});

test("normalizeSession — normalizes legacy MockAuthUserRecord and standard User sessions", () => {
  // Legacy user record with name property
  const legacySession = normalizeSession({
    token: "mock_token_123",
    expiresAt: 1700000000000,
    user: {
      id: "usr_legacy_001",
      email: "legacy@example.com",
      name: "Legacy User",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  });

  assert.ok(legacySession);
  assert.equal(legacySession.token, "mock_token_123");
  assert.equal(legacySession.expiresAt, 1700000000000);
  assert.equal(legacySession.user.id, "usr_legacy_001");
  assert.equal(legacySession.user.displayName, "Legacy User");
  assert.equal(legacySession.user.email, "legacy@example.com");

  // Standard user session
  const standardSession = normalizeSession({
    token: "mock_token_456",
    expiresAt: 1700000000000,
    user: {
      id: "usr_std_001",
      email: "std@example.com",
      displayName: "Standard User",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  });

  assert.ok(standardSession);
  assert.equal(standardSession.user.displayName, "Standard User");
});

test("mockAuth.signIn — succeeds with valid credentials and fails on wrong password", async () => {
  const session = await mockAuth.signIn("demo@neurowealth.app", "demo123");
  assert.ok(session);
  assert.equal(session.user.email, "demo@neurowealth.app");
  assert.ok(session.token.startsWith("mock_token_"));

  await assert.rejects(
    async () => mockAuth.signIn("demo@neurowealth.app", "wrongpassword"),
    /Invalid email or password/,
  );
});

test("mockAuth.signIn — enforces rate limiting after max request threshold", async () => {
  const email = "ratelimit-test@example.com";
  // Consume 5 allowed failed attempts
  for (let i = 0; i < 5; i++) {
    try {
      await mockAuth.signIn(email, "badpass");
    } catch (err: unknown) {
      assert.match((err as Error).message, /Invalid email or password/);
    }
  }

  // 6th attempt must be blocked by rate limiter
  await assert.rejects(
    async () => mockAuth.signIn(email, "badpass"),
    /Too many sign-in attempts\. Please try again later\./,
  );
});

test("mockAuth.signUp — handles new account creation and returns enumeration-safe error for existing email", async () => {
  const newEmail = `newuser_${Date.now()}@example.com`;
  const session = await mockAuth.signUp(newEmail, "New User", "password123");

  assert.ok(session);
  assert.equal(session.user.email, newEmail);
  assert.equal(session.user.displayName, "New User");
  assert.ok(session.token.startsWith("mock_token_"));

  // Attempting to sign up with existing email returns enumeration-safe message
  await assert.rejects(
    async () => mockAuth.signUp("demo@neurowealth.app", "Duplicate", "pass123"),
    /If this email is available, a confirmation has been sent\./,
  );
});
