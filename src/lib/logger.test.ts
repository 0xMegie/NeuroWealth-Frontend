import assert from "node:assert/strict";
import test from "node:test";

import { isLogLevelEnabled, scrubPII } from "@/lib/logger";

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("scrubPII redacts sensitive keys", () => {
  const result = scrubPII({
    email: "user@example.com",
    operation: "sign_in",
    nested: { token: "abc123", count: 1 },
  }) as Record<string, unknown>;

  assert.equal(result.email, "***REDACTED***");
  assert.equal(result.operation, "sign_in");
  assert.equal((result.nested as Record<string, unknown>).token, "***REDACTED***");
  assert.equal((result.nested as Record<string, unknown>).count, 1);
});

test("scrubPII redacts email patterns in string values", () => {
  const result = scrubPII("Contact user@example.com for help");
  assert.equal(result, "Contact ***REDACTED*** for help");
});

test("isLogLevelEnabled respects NEXT_PUBLIC_LOG_LEVEL=silent", () => {
  process.env.NEXT_PUBLIC_LOG_LEVEL = "silent";
  assert.equal(isLogLevelEnabled("error"), false);
});

test("isLogLevelEnabled defaults to warn minimum in production", () => {
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_LOG_LEVEL;
  assert.equal(isLogLevelEnabled("info"), false);
  assert.equal(isLogLevelEnabled("warn"), true);
  assert.equal(isLogLevelEnabled("error"), true);
});
