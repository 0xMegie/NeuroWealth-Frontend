import assert from "node:assert/strict";
import test from "node:test";

import { TransactionService, type Transaction } from "./transaction-service";
import { assertRejectsWithOriginalMessage } from "./test-helpers";

function createService() {
  // retryAttempts: 1 — deterministic "not found"/"invalid state" errors get
  // retried and rethrown wrapped as a generic TIMEOUT error under the default
  // retryAttempts: 3, masking the original message these tests assert on.
  return new TransactionService({
    simulateLatency: false,
    simulateFailure: false,
    retryAttempts: 1,
  });
}

test("getTransactionStats computes all counters in one pass for mock user_1", async () => {
  const service = createService();
  const response = await service.getTransactionStats("user_1");

  assert.equal(response.data.totalTransactions, 3);
  assert.equal(response.data.completedTransactions, 2);
  assert.equal(response.data.pendingTransactions, 1);
  assert.equal(response.data.failedTransactions, 0);
  // Only completed amounts: 10000 + 5000
  assert.equal(response.data.totalVolume, 15000);
});

test("getTransactionStats returns zeros for a user with no transactions", async () => {
  const service = createService();
  const response = await service.getTransactionStats("user_unknown");

  assert.deepEqual(response.data, {
    totalVolume: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  });
});

test("getTransactionStats counts failed volume separately from totalVolume", async () => {
  const service = createService();
  const failed: Transaction = {
    id: "tx_failed",
    userId: "user_stats",
    type: "withdrawal",
    amount: 999,
    asset: "USDC",
    status: "failed",
    createdAt: new Date().toISOString(),
  };
  const completed: Transaction = {
    id: "tx_ok",
    userId: "user_stats",
    type: "deposit",
    amount: 100,
    asset: "USDC",
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  // Seed via the private mock map used by the service (test-only).
  (
    service as unknown as { mockTransactions: Map<string, Transaction[]> }
  ).mockTransactions.set("user_stats", [failed, completed]);

  const response = await service.getTransactionStats("user_stats");

  assert.equal(response.data.totalTransactions, 2);
  assert.equal(response.data.completedTransactions, 1);
  assert.equal(response.data.failedTransactions, 1);
  assert.equal(response.data.pendingTransactions, 0);
  assert.equal(response.data.totalVolume, 100);
});

// ── createTransaction — the fee calculation logic called out in #539 ────────
//
// createTransaction schedules a real 3-5s setTimeout chain via
// simulateTransactionProcessing() to flip status pending -> processing ->
// completed. These tests only assert on the transaction returned
// synchronously and do not await that chain.

test("createTransaction charges the flat baseFee when the percentage fee would be smaller", async () => {
  const service = createService();
  const response = await service.createTransaction("user_1", {
    type: "deposit",
    amount: 5,
    asset: "USDC",
  });

  // percentageFee = 5 * 0.001 = 0.005, below the 0.01 baseFee floor.
  assert.equal(response.data.fee, 0.01);
  assert.equal(response.data.status, "pending");
});

test("createTransaction charges the percentage fee once it exceeds the baseFee floor", async () => {
  const service = createService();
  const response = await service.createTransaction("user_1", {
    type: "withdrawal",
    amount: 1000,
    asset: "USDC",
  });

  // percentageFee = 1000 * 0.001 = 1, above the 0.01 baseFee floor.
  assert.equal(response.data.fee, 1);
});

test("createTransaction prepends the new transaction so it is returned first by getUserTransactions", async () => {
  const service = createService();
  const created = await service.createTransaction("user_1", {
    type: "deposit",
    amount: 50,
    asset: "USDC",
  });

  const list = await service.getUserTransactions("user_1", { page: 1, limit: 10 });
  assert.equal(list.data.items[0].id, created.data.id);
  assert.equal(list.data.total, 4); // 3 seeded + 1 new
});

// ── getTransaction ────────────────────────────────────────────────────────────

test("getTransaction returns a transaction by id for the owning user", async () => {
  const service = createService();
  const response = await service.getTransaction("user_1", "tx_1");
  assert.equal(response.data.type, "deposit");
});

test("getTransaction rejects an unknown transaction id", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.getTransaction("user_1", "tx_does_not_exist"),
    /transaction not found/i,
  );
});

// ── getUserTransactions — filtering ───────────────────────────────────────────

test("getUserTransactions filters by type", async () => {
  const service = createService();
  const response = await service.getUserTransactions("user_1", {
    page: 1,
    limit: 10,
    filter: { type: "withdrawal" },
  });

  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].id, "tx_3");
});

test("getUserTransactions filters by status", async () => {
  const service = createService();
  const response = await service.getUserTransactions("user_1", {
    page: 1,
    limit: 10,
    filter: { status: "completed" },
  });

  assert.equal(response.data.items.length, 2);
  assert.ok(response.data.items.every((t) => t.status === "completed"));
});

test("getUserTransactions filters by a startDate/endDate window", async () => {
  const service = createService();
  const response = await service.getUserTransactions("user_1", {
    page: 1,
    limit: 10,
    filter: {
      startDate: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
  });

  // Only tx_3 (created 30 minutes ago) falls inside a 90-minute window.
  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.items[0].id, "tx_3");
});

test("getUserTransactions paginates results", async () => {
  const service = createService();
  const response = await service.getUserTransactions("user_1", { page: 1, limit: 2 });

  assert.equal(response.data.items.length, 2);
  assert.equal(response.data.total, 3);
  assert.equal(response.data.hasMore, true);
});

// ── cancelTransaction ─────────────────────────────────────────────────────────

test("cancelTransaction cancels a pending transaction", async () => {
  const service = createService();
  const response = await service.cancelTransaction("user_1", "tx_3");
  assert.equal(response.data.status, "cancelled");
});

test("cancelTransaction rejects a transaction that is not pending", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.cancelTransaction("user_1", "tx_1"),
    /cannot cancel transaction in current state/i,
  );
});

test("cancelTransaction rejects an unknown transaction id", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.cancelTransaction("user_1", "tx_does_not_exist"),
    /transaction not found/i,
  );
});
