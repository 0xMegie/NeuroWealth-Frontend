import assert from "node:assert/strict";
import test from "node:test";

import { BaseAdapter } from "./base-adapter";
import { ServiceException } from "./types";

// BaseAdapter is abstract — exercise it through a minimal concrete subclass
// that exposes the protected helpers under test.
class TestAdapter extends BaseAdapter {
  runWithRetry<T>(operation: () => Promise<T>, context = "TestAdapter.run") {
    return this.executeWithRetry(operation, context);
  }

  buildResponse<T>(data: T) {
    return this.createResponse(data);
  }

  triggerHandleError(error: unknown, context = "TestAdapter.op"): never {
    return this.handleError(error, context);
  }
}

function createAdapter(overrides: ConstructorParameters<typeof TestAdapter>[0] = {}) {
  return new TestAdapter({
    simulateLatency: false,
    simulateFailure: false,
    retryDelay: 1,
    ...overrides,
  });
}

// ── executeWithRetry ─────────────────────────────────────────────────────────

test("executeWithRetry returns the operation's result on first success", async () => {
  const adapter = createAdapter();
  const result = await adapter.runWithRetry(async () => "ok");
  assert.equal(result, "ok");
});

test("executeWithRetry retries after a transient failure and eventually succeeds", async () => {
  const adapter = createAdapter({ retryAttempts: 3 });
  let calls = 0;

  const result = await adapter.runWithRetry(async () => {
    calls += 1;
    if (calls < 2) {
      throw new Error("transient failure");
    }
    return "recovered";
  });

  assert.equal(result, "recovered");
  assert.equal(calls, 2);
});

test("executeWithRetry attempts exactly retryAttempts times before giving up", async () => {
  const adapter = createAdapter({ retryAttempts: 3 });
  let calls = 0;

  await assert.rejects(() =>
    adapter.runWithRetry(async () => {
      calls += 1;
      throw new Error("always fails");
    }),
  );

  assert.equal(calls, 3);
});

test("executeWithRetry throws a ServiceException with TIMEOUT code after exhausting attempts", async () => {
  const adapter = createAdapter({ retryAttempts: 2 });

  await assert.rejects(
    () =>
      adapter.runWithRetry(async () => {
        throw new Error("boom");
      }, "TestAdapter.exhaust"),
    (error: unknown) => {
      assert.ok(error instanceof ServiceException);
      assert.equal(error.code, "TIMEOUT");
      assert.match(error.message, /TestAdapter\.exhaust/);
      assert.equal(
        (error.details as { originalError?: string })?.originalError,
        "boom",
      );
      return true;
    },
  );
});

test("executeWithRetry backs off exponentially between attempts", async () => {
  const adapter = createAdapter({ retryAttempts: 3, retryDelay: 20 });
  const timestamps: number[] = [];

  await assert.rejects(() =>
    adapter.runWithRetry(async () => {
      timestamps.push(Date.now());
      throw new Error("always fails");
    }),
  );

  assert.equal(timestamps.length, 3);
  const firstGap = timestamps[1] - timestamps[0];
  const secondGap = timestamps[2] - timestamps[1];

  // retryDelay * 2^0 = 20ms, then retryDelay * 2^1 = 40ms.
  assert.ok(firstGap >= 15, `expected first backoff >= 15ms, got ${firstGap}ms`);
  assert.ok(
    secondGap > firstGap,
    `expected second backoff (${secondGap}ms) to exceed first (${firstGap}ms)`,
  );
});

// ── createResponse ────────────────────────────────────────────────────────────

test("createResponse wraps data with meta.requestId, timestamp, and version", () => {
  const adapter = createAdapter();
  const response = adapter.buildResponse({ hello: "world" });

  assert.deepEqual(response.data, { hello: "world" });
  assert.ok(response.meta?.requestId.startsWith("req_"));
  assert.equal(response.meta?.version, "1.0.0");
  assert.ok(!Number.isNaN(Date.parse(response.meta!.timestamp)));
});

// ── handleError ───────────────────────────────────────────────────────────────

test("handleError rethrows an existing ServiceException unchanged", () => {
  const adapter = createAdapter();
  const original = new ServiceException({
    code: "VALIDATION_ERROR",
    message: "already a service error",
    timestamp: new Date().toISOString(),
  });

  assert.throws(
    () => adapter.triggerHandleError(original),
    (error: unknown) => error === original,
  );
});

test("handleError wraps a generic Error as SERVER_ERROR by default", () => {
  const adapter = createAdapter();

  assert.throws(
    () => adapter.triggerHandleError(new Error("plain failure"), "TestAdapter.wrap"),
    (error: unknown) => {
      assert.ok(error instanceof ServiceException);
      assert.equal(error.code, "SERVER_ERROR");
      assert.match(error.message, /TestAdapter\.wrap/);
      assert.match(error.message, /plain failure/);
      return true;
    },
  );
});

test("handleError maps a recognized error.code to the matching ServiceErrorCode", () => {
  const adapter = createAdapter();

  assert.throws(
    () => adapter.triggerHandleError({ code: "NOT_FOUND", message: "missing" }),
    (error: unknown) => {
      assert.ok(error instanceof ServiceException);
      assert.equal(error.code, "NOT_FOUND");
      return true;
    },
  );
});

test("handleError falls back to SERVER_ERROR for an unrecognized error.code", () => {
  const adapter = createAdapter();

  assert.throws(
    () => adapter.triggerHandleError({ code: "SOMETHING_WEIRD" }),
    (error: unknown) => {
      assert.ok(error instanceof ServiceException);
      assert.equal(error.code, "SERVER_ERROR");
      return true;
    },
  );
});

// ── config ────────────────────────────────────────────────────────────────────

test("getConfig returns a snapshot; updateConfig merges over the previous config", () => {
  const adapter = createAdapter({ retryAttempts: 3 });

  const snapshot = adapter.getConfig();
  assert.equal(snapshot.retryAttempts, 3);

  adapter.updateConfig({ retryAttempts: 5 });
  assert.equal(adapter.getConfig().retryAttempts, 5);
  // Unrelated config is preserved across the partial update.
  assert.equal(adapter.getConfig().simulateFailure, false);
});

test("getConfig returns a copy, not a live reference", () => {
  const adapter = createAdapter();
  const snapshot = adapter.getConfig();
  snapshot.retryAttempts = 999;

  assert.notEqual(adapter.getConfig().retryAttempts, 999);
});
