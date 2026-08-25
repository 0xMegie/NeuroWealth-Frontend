import assert from "node:assert/strict";
import test from "node:test";

import {
  ServiceError,
  executeWithRetry,
  executeWithTimeout,
  executeWithRetryAndTimeout,
} from "@/lib/service-layer/base-adapter";

// ── ServiceError construction ──────────────────────────────────────────

test("base-adapter — error: ServiceError stores message and code", () => {
  const error = new ServiceError("Something went wrong", "CUSTOM_CODE");
  assert.equal(error.message, "Something went wrong");
  assert.equal(error.code, "CUSTOM_CODE");
  assert.equal(error.name, "ServiceError");
});

// ── executeWithRetry: success cases ────────────────────────────────────

test("base-adapter — retry: succeeds on first attempt", async () => {
  let attempts = 0;
  const result = await executeWithRetry(async () => {
    attempts += 1;
    return "success";
  });

  assert.equal(result, "success");
  assert.equal(attempts, 1);
});

test("base-adapter — retry: succeeds on second attempt after error", async () => {
  let attempts = 0;
  const result = await executeWithRetry(async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error("First attempt fails");
    }
    return "success";
  });

  assert.equal(result, "success");
  assert.equal(attempts, 2);
});

test("base-adapter — retry: succeeds on final attempt", async () => {
  let attempts = 0;
  const result = await executeWithRetry(async () => {
    attempts += 1;
    if (attempts < 3) {
      throw new Error(`Attempt ${attempts} fails`);
    }
    return "success";
  });

  assert.equal(result, "success");
  assert.equal(attempts, 3);
});

// ── executeWithRetry: failure cases ────────────────────────────────────

test("base-adapter — retry: throws after max attempts exhausted", async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      executeWithRetry(
        async () => {
          attempts += 1;
          throw new Error("Always fails");
        },
        { maxAttempts: 3 },
      ),
    (err) => err instanceof ServiceError && err.code === "UNKNOWN_ERROR",
  );

  assert.equal(attempts, 3);
});

test("base-adapter — retry: default maxAttempts is 3", async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        attempts += 1;
        throw new Error("Always fails");
      }),
  );

  assert.equal(attempts, 3);
});

// ── Exponential backoff timing ─────────────────────────────────────────

test("base-adapter — backoff: exponential delay between attempts", async () => {
  let attempts = 0;
  const startTime = Date.now();

  await assert.rejects(
    () =>
      executeWithRetry(
        async () => {
          attempts += 1;
          throw new Error("Fail");
        },
        {
          maxAttempts: 3,
          initialDelayMs: 50,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
        },
      ),
  );

  const totalTime = Date.now() - startTime;

  assert.equal(attempts, 3);
  // Total time should be approximately: 50ms (after 1st fail) + 100ms (after 2nd fail) = 150ms
  // But with timing variance, we expect at least 100ms (two delays) and less than 300ms
  assert.ok(totalTime >= 100, `Expected totalTime >= 100, got ${totalTime}`);
  assert.ok(totalTime < 300, `Expected totalTime < 300, got ${totalTime}`);
});

test("base-adapter — backoff: caps delay at maxDelayMs", async () => {
  let attempts = 0;
  const startTime = Date.now();

  await assert.rejects(
    () =>
      executeWithRetry(
        async () => {
          attempts += 1;
          throw new Error("Fail");
        },
        {
          maxAttempts: 4,
          initialDelayMs: 100,
          backoffMultiplier: 10,
          maxDelayMs: 200,
        },
      ),
  );

  const totalTime = Date.now() - startTime;

  assert.equal(attempts, 4);
  // With max delay of 200ms:
  // delays: 100ms, 200ms (capped), 200ms (capped) = 500ms total
  // Actual time should be roughly 400-600ms
  assert.ok(totalTime >= 300, `Expected totalTime >= 300, got ${totalTime}`);
  assert.ok(totalTime < 800, `Expected totalTime < 800, got ${totalTime}`);
});

test("base-adapter — backoff: no delay on final attempt", async () => {
  let attempts = 0;
  const startTime = Date.now();

  await assert.rejects(
    () =>
      executeWithRetry(
        async () => {
          attempts += 1;
          throw new Error("Fail");
        },
        {
          maxAttempts: 2,
          initialDelayMs: 100,
          backoffMultiplier: 2,
          maxDelayMs: 5000,
        },
      ),
  );

  const totalTime = Date.now() - startTime;

  assert.equal(attempts, 2);
  // Only one delay (after first attempt, not after second/final)
  assert.ok(totalTime >= 50, `Expected totalTime >= 50, got ${totalTime}`);
  assert.ok(totalTime < 250, `Expected totalTime < 250, got ${totalTime}`);
});

// ── Error handling ────────────────────────────────────────────────────

test("base-adapter — error-handling: Error instance is wrapped", async () => {
  const originalError = new Error("Original");
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        throw originalError;
      }),
    (err) => err instanceof ServiceError && err.message === "Original",
  );
});

test("base-adapter — error-handling: string thrown value is handled", async () => {
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        // eslint-disable-next-line no-throw-literal
        throw "String error";
      }),
    (err) => err instanceof ServiceError && err.message === "String error",
  );
});

test("base-adapter — error-handling: undefined/null thrown value is handled", async () => {
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        // eslint-disable-next-line no-throw-literal
        throw undefined;
      }),
    (err) =>
      err instanceof ServiceError &&
      err.message === "An unknown error occurred",
  );
});

test("base-adapter — error-handling: object without message property is handled", async () => {
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        // eslint-disable-next-line no-throw-literal
        throw { code: "CUSTOM", details: "Something" };
      }),
    (err) =>
      err instanceof ServiceError &&
      err.message === "An unknown error occurred",
  );
});

test("base-adapter — error-handling: ServiceError is passed through", async () => {
  const serviceError = new ServiceError("Service failed", "SERVICE_ERROR");
  await assert.rejects(
    () =>
      executeWithRetry(async () => {
        throw serviceError;
      }),
    (err) =>
      err === serviceError &&
      err.code === "SERVICE_ERROR",
  );
});

// ── executeWithTimeout ────────────────────────────────────────────────

test("base-adapter — timeout: succeeds when promise resolves before timeout", async () => {
  const result = await executeWithTimeout(
    async () => {
      return "success";
    },
    1000,
  );

  assert.equal(result, "success");
});

test("base-adapter — timeout: throws when promise exceeds timeout", async () => {
  await assert.rejects(
    () =>
      executeWithTimeout(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return "success";
        },
        100,
      ),
    (err) => err instanceof ServiceError && err.code === "TIMEOUT",
  );
});

// ── executeWithRetryAndTimeout ────────────────────────────────────────

test("base-adapter — retry+timeout: succeeds on first attempt within timeout", async () => {
  let attempts = 0;
  const result = await executeWithRetryAndTimeout(
    async () => {
      attempts += 1;
      return "success";
    },
    { maxAttempts: 3 },
    1000,
  );

  assert.equal(result, "success");
  assert.equal(attempts, 1);
});

test("base-adapter — retry+timeout: retries when attempt times out", async () => {
  let attempts = 0;
  const result = await executeWithRetryAndTimeout(
    async () => {
      attempts += 1;
      if (attempts === 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      return "success";
    },
    { maxAttempts: 3, initialDelayMs: 10 },
    100,
  );

  assert.equal(result, "success");
  assert.equal(attempts, 2);
});

test("base-adapter — retry+timeout: throws when all attempts timeout", async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      executeWithRetryAndTimeout(
        async () => {
          attempts += 1;
          await new Promise((resolve) => setTimeout(resolve, 500));
          return "success";
        },
        { maxAttempts: 2, initialDelayMs: 10 },
        100,
      ),
    (err) => err instanceof ServiceError && err.code === "TIMEOUT",
  );

  assert.equal(attempts, 2);
});

// ── Non-Error crash fix verification ───────────────────────────────────

test("base-adapter — crash-fix: non-Error thrown doesn't crash error handler", async () => {
  // This test verifies the core fix: that thrown non-Error values don't
  // cause a secondary TypeError in handleError when accessing .message/.code
  let didCrash = false;

  try {
    await executeWithRetry(async () => {
      // eslint-disable-next-line no-throw-literal
      throw { notAnError: true };
    });
  } catch (err) {
    // Should catch a ServiceError, not a TypeError about accessing .message
    if (err instanceof TypeError) {
      didCrash = true;
    }
  }

  assert.equal(didCrash, false, "Error handler should not crash on non-Error values");
});

test("base-adapter — crash-fix: number thrown value is safe", async () => {
  let errorMessage = "";

  try {
    await executeWithRetry(async () => {
      // eslint-disable-next-line no-throw-literal
      throw 42;
    });
  } catch (err) {
    if (err instanceof ServiceError) {
      errorMessage = err.message;
    }
  }

  assert.equal(errorMessage, "An unknown error occurred");
});

test("base-adapter — crash-fix: boolean thrown value is safe", async () => {
  let errorMessage = "";

  try {
    await executeWithRetry(async () => {
      // eslint-disable-next-line no-throw-literal
      throw false;
    });
  } catch (err) {
    if (err instanceof ServiceError) {
      errorMessage = err.message;
    }
  }

  assert.equal(errorMessage, "An unknown error occurred");
});
