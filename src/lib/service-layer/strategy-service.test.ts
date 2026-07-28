import assert from "node:assert/strict";
import test from "node:test";

import { StrategyService } from "./strategy-service";
import { assertRejectsWithOriginalMessage } from "./test-helpers";

function createService() {
  // retryAttempts: 1 — see auth-service.test.ts for why this matters: without
  // it, deterministic validation/"not found" errors get retried and rethrown
  // wrapped as a generic TIMEOUT error instead of the original message.
  return new StrategyService({
    simulateLatency: false,
    simulateFailure: false,
    retryAttempts: 1,
  });
}

// ── getStrategies / getStrategy ───────────────────────────────────────────────

test("getStrategies returns only active seeded strategies", async () => {
  const service = createService();
  const response = await service.getStrategies();

  assert.equal(response.data.length, 3);
  assert.ok(response.data.every((s) => s.isActive));
});

test("getStrategy returns a strategy by id", async () => {
  const service = createService();
  const response = await service.getStrategy("strategy_2");
  assert.equal(response.data.name, "Balanced Growth");
});

test("getStrategy rejects an unknown id", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(() => service.getStrategy("strategy_nope"), /strategy not found/i);
});

// ── getUserAllocations ────────────────────────────────────────────────────────

test("getUserAllocations returns the seeded allocation for user_1", async () => {
  const service = createService();
  const response = await service.getUserAllocations("user_1", { page: 1, limit: 10 });

  assert.equal(response.data.total, 1);
  assert.equal(response.data.items[0].strategyId, "strategy_1");
});

test("getUserAllocations returns an empty page for a user with no allocations", async () => {
  const service = createService();
  const response = await service.getUserAllocations("user_none", { page: 1, limit: 10 });

  assert.deepEqual(response.data.items, []);
  assert.equal(response.data.total, 0);
  assert.equal(response.data.hasMore, false);
});

// ── createAllocation — the allocation validation logic called out in #539 ────

test("createAllocation rejects an amount below the strategy's minDeposit", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.createAllocation("user_1", "strategy_1", 1),
    /minimum deposit is 100/i,
  );
});

test("createAllocation rejects an amount above the strategy's maxDeposit", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.createAllocation("user_1", "strategy_1", 1_000_000),
    /maximum deposit is 50000/i,
  );
});

test("createAllocation rejects an unknown strategy", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.createAllocation("user_1", "strategy_nope", 500),
    /strategy not found/i,
  );
});

test("createAllocation accepts a valid amount and computes the expected return from strategy APY/lockPeriod", async () => {
  const service = createService();
  const response = await service.createAllocation("user_1", "strategy_1", 500);

  assert.equal(response.data.status, "pending");
  assert.equal(response.data.userId, "user_1");
  assert.equal(response.data.strategyId, "strategy_1");
  assert.equal(response.data.amount, 500);

  // expectedReturn = amount * (expectedApy / 100) * (lockPeriod / 365)
  const expected = 500 * (5 / 100) * (30 / 365);
  assert.ok(
    Math.abs(response.data.expectedReturn - expected) < 1e-9,
    `expected ~${expected}, got ${response.data.expectedReturn}`,
  );
});

test("createAllocation appends to the user's existing allocations rather than replacing them", async () => {
  const service = createService();
  await service.createAllocation("user_1", "strategy_2", 500);

  const response = await service.getUserAllocations("user_1", { page: 1, limit: 10 });
  // 1 seeded allocation + 1 newly created.
  assert.equal(response.data.total, 2);
});

// ── cancelAllocation ──────────────────────────────────────────────────────────

test("cancelAllocation marks a pending allocation as cancelled", async () => {
  const service = createService();
  const created = await service.createAllocation("user_1", "strategy_1", 500);

  const cancelled = await service.cancelAllocation("user_1", created.data.id);
  assert.equal(cancelled.data.status, "cancelled");
});

test("cancelAllocation rejects an unknown allocation id", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.cancelAllocation("user_1", "alloc_does_not_exist"),
    /allocation not found/i,
  );
});

test("cancelAllocation rejects an allocation that is already cancelled", async () => {
  const service = createService();
  const created = await service.createAllocation("user_1", "strategy_1", 500);
  await service.cancelAllocation("user_1", created.data.id);

  await assertRejectsWithOriginalMessage(
    () => service.cancelAllocation("user_1", created.data.id),
    /cannot cancel allocation in current state/i,
  );
});

// ── getStrategyPerformance ────────────────────────────────────────────────────

test("getStrategyPerformance paginates the 31-day seeded performance series", async () => {
  const service = createService();
  const response = await service.getStrategyPerformance("strategy_1", { page: 1, limit: 10 });

  assert.equal(response.data.items.length, 10);
  assert.equal(response.data.total, 31);
  assert.ok(response.data.items.every((p) => p.strategyId === "strategy_1"));
});

test("getStrategyPerformance rejects an unknown strategy", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.getStrategyPerformance("strategy_nope", { page: 1, limit: 10 }),
    /performance data not found/i,
  );
});
