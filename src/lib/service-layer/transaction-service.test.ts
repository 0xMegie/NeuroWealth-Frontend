import assert from "node:assert/strict";
import test from "node:test";

import { TransactionService, type Transaction } from "./transaction-service";

function createService() {
  return new TransactionService({ simulateLatency: false, simulateFailure: false });
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
