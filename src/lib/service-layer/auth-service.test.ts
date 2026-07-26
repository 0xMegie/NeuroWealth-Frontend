import assert from "node:assert/strict";
import test from "node:test";

import { AuthService } from "./auth-service";
import { assertRejectsWithOriginalMessage } from "./test-helpers";

function createService() {
  // retryAttempts: 1 — business-logic errors (invalid credentials, unknown
  // token, etc.) are thrown deterministically inside executeWithRetry's
  // operation, so with the default retryAttempts: 3 they'd be retried
  // pointlessly and rethrown wrapped as a generic TIMEOUT error, masking the
  // actual message these tests assert on.
  return new AuthService({ simulateLatency: false, simulateFailure: false, retryAttempts: 1 });
}

// ── login ─────────────────────────────────────────────────────────────────────

test("login succeeds for the seeded mock user and returns a session", async () => {
  const service = createService();
  const response = await service.login({
    email: "user@example.com",
    password: "anything",
  });

  assert.equal(response.data.user.email, "user@example.com");
  assert.ok(response.data.token.length > 0);
  assert.ok(response.data.refreshToken.length > 0);
  assert.ok(Date.parse(response.data.expiresAt) > Date.now());
});

test("login rejects an email that was never registered", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.login({ email: "nobody@example.com", password: "x" }),
    /invalid credentials/i,
  );
});

test("login rejects an unverified user", async () => {
  const service = createService();
  const signup = await service.signup({
    email: "unverified@example.com",
    password: "pw",
    fullName: "Unverified User",
  });
  assert.equal(signup.data.user.isVerified, false);

  await assertRejectsWithOriginalMessage(
    () => service.login({ email: "unverified@example.com", password: "pw" }),
    /email not verified/i,
  );
});

// ── signup ────────────────────────────────────────────────────────────────────

test("signup creates a new, unverified user and returns a session", async () => {
  const service = createService();
  const response = await service.signup({
    email: "new-user@example.com",
    password: "pw",
    fullName: "New User",
  });

  assert.equal(response.data.user.email, "new-user@example.com");
  assert.equal(response.data.user.fullName, "New User");
  assert.equal(response.data.user.isVerified, false);
});

test("signup rejects an email that is already registered", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () =>
      service.signup({
        email: "user@example.com",
        password: "pw",
        fullName: "Duplicate",
      }),
    /already registered/i,
  );
});

// ── logout ────────────────────────────────────────────────────────────────────

test("logout invalidates the session token so refreshToken can no longer use it", async () => {
  const service = createService();
  const { data: session } = await service.login({
    email: "user@example.com",
    password: "pw",
  });

  await service.logout(session.token);

  await assertRejectsWithOriginalMessage(
    () => service.refreshToken(session.refreshToken),
    /invalid refresh token/i,
  );
});

// ── refreshToken ──────────────────────────────────────────────────────────────

test("refreshToken issues a new token/refreshToken pair for a valid refresh token", async () => {
  const service = createService();
  const { data: session } = await service.login({
    email: "user@example.com",
    password: "pw",
  });

  const refreshed = await service.refreshToken(session.refreshToken);

  assert.notEqual(refreshed.data.token, session.token);
  assert.notEqual(refreshed.data.refreshToken, session.refreshToken);
  assert.equal(refreshed.data.user.id, session.user.id);
});

test("refreshToken rejects an unknown refresh token", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.refreshToken("not-a-real-refresh-token"),
    /invalid refresh token/i,
  );
});

// ── verifyEmail ───────────────────────────────────────────────────────────────

test("verifyEmail marks the matching user as verified", async () => {
  const service = createService();
  const signup = await service.signup({
    email: "to-verify@example.com",
    password: "pw",
    fullName: "To Verify",
  });

  const result = await service.verifyEmail(signup.data.user.id);
  assert.equal(result.data.success, true);

  const login = await service.login({
    email: "to-verify@example.com",
    password: "pw",
  });
  assert.equal(login.data.user.isVerified, true);
});

test("verifyEmail rejects an unknown token", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.verifyEmail("no-such-user-id"),
    /invalid verification token/i,
  );
});

// ── resetPassword ─────────────────────────────────────────────────────────────

test("resetPassword succeeds for a known email", async () => {
  const service = createService();
  const result = await service.resetPassword("user@example.com");
  assert.equal(result.data.success, true);
});

test("resetPassword rejects an unknown email", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.resetPassword("nobody@example.com"),
    /email not found/i,
  );
});
