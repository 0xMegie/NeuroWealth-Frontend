import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import {
  isSessionCookieValid,
  getSessionFromRequest,
  requireAuth,
} from "./api-auth";
import { SESSION_COOKIE_NAME } from "./auth-constants";

function createValidCookieValue(expiresInMs = 3600 * 1000): string {
  return encodeURIComponent(
    JSON.stringify({
      token: "test_token_valid_123",
      expiresAt: Date.now() + expiresInMs,
    }),
  );
}

test("isSessionCookieValid — returns false for missing or invalid cookies", () => {
  assert.equal(isSessionCookieValid(undefined), false);
  assert.equal(isSessionCookieValid(""), false);
  assert.equal(isSessionCookieValid("invalid-json"), false);
  assert.equal(
    isSessionCookieValid(encodeURIComponent(JSON.stringify({}))),
    false,
  );
  assert.equal(
    isSessionCookieValid(
      encodeURIComponent(JSON.stringify({ token: "tok" })),
    ),
    false,
  );
  assert.equal(
    isSessionCookieValid(
      encodeURIComponent(JSON.stringify({ expiresAt: Date.now() + 10000 })),
    ),
    false,
  );
});

test("isSessionCookieValid — returns false for expired sessions", () => {
  const expiredCookie = encodeURIComponent(
    JSON.stringify({
      token: "test_token",
      expiresAt: Date.now() - 1000,
    }),
  );
  assert.equal(isSessionCookieValid(expiredCookie), false);
});

test("isSessionCookieValid — returns true for valid session cookies", () => {
  const validCookie = createValidCookieValue();
  assert.equal(isSessionCookieValid(validCookie), true);
});

test("getSessionFromRequest — extracts session from NextRequest cookies", () => {
  const unauthReq = new NextRequest("http://localhost:3000/api/test");
  assert.equal(getSessionFromRequest(unauthReq), null);

  const invalidReq = new NextRequest("http://localhost:3000/api/test", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=invalid` },
  });
  assert.equal(getSessionFromRequest(invalidReq), null);

  const validReq = new NextRequest("http://localhost:3000/api/test", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${createValidCookieValue()}` },
  });
  const session = getSessionFromRequest(validReq);
  assert.ok(session);
  assert.equal(session.token, "test_token_valid_123");
  assert.equal(typeof session.expiresAt, "number");
});

test("requireAuth — allows authenticated requests and blocks unauthenticated ones", async () => {
  const validReq = new NextRequest("http://localhost:3000/api/test", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${createValidCookieValue()}` },
  });
  assert.equal(requireAuth(validReq), null);

  const unauthReq = new NextRequest("http://localhost:3000/api/test");
  const authResponse = requireAuth(unauthReq);
  assert.ok(authResponse);
  assert.equal(authResponse.status, 401);

  const body = await authResponse.json();
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
  assert.ok(body.error.message);
});
