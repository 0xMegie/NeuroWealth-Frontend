import assert from "node:assert/strict";

import { ServiceException } from "./types";

/**
 * Service methods wrap their business logic in executeWithRetry(), which
 * always rewraps a thrown error as a generic TIMEOUT ServiceException once
 * retries are exhausted (see base-adapter.ts) — the original message is not
 * on `.message`, it's preserved verbatim in `details.originalError`. Use this
 * instead of asserting on the top-level message when testing a service
 * method's validation/not-found errors.
 */
export async function assertRejectsWithOriginalMessage(
  operation: () => Promise<unknown>,
  expected: RegExp,
): Promise<void> {
  await assert.rejects(operation, (error: unknown) => {
    assert.ok(error instanceof ServiceException, "expected a ServiceException");
    const details = error.details as { originalError?: string } | undefined;
    assert.match(details?.originalError ?? "", expected);
    return true;
  });
}
