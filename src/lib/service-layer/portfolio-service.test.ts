import assert from "node:assert/strict";
import test from "node:test";

import { PortfolioService } from "./portfolio-service";
import { assertRejectsWithOriginalMessage } from "./test-helpers";

function createService() {
  // retryAttempts: 1 — see auth-service.test.ts for why this matters: without
  // it, deterministic "not found" errors get retried and rethrown wrapped as
  // a generic TIMEOUT error instead of the original message.
  return new PortfolioService({
    simulateLatency: false,
    simulateFailure: false,
    retryAttempts: 1,
  });
}

// ── getPortfolio ──────────────────────────────────────────────────────────────

test("getPortfolio returns the seeded portfolio for user_1", async () => {
  const service = createService();
  const response = await service.getPortfolio("user_1");

  assert.equal(response.data.userId, "user_1");
  assert.equal(response.data.assets.length, 2);
});

test("getPortfolio rejects an unknown user", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(() => service.getPortfolio("user_unknown"), /portfolio not found/i);
});

// ── getPortfolioHistory ───────────────────────────────────────────────────────

test("getPortfolioHistory paginates the 31-day seeded history", async () => {
  const service = createService();
  const response = await service.getPortfolioHistory("user_1", { page: 1, limit: 10 });

  assert.equal(response.data.items.length, 10);
  assert.equal(response.data.total, 31);
  assert.equal(response.data.hasMore, true);
});

test("getPortfolioHistory reports hasMore=false on the final page", async () => {
  const service = createService();
  const response = await service.getPortfolioHistory("user_1", { page: 4, limit: 10 });

  assert.equal(response.data.items.length, 1);
  assert.equal(response.data.hasMore, false);
});

test("getPortfolioHistory rejects an unknown user", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.getPortfolioHistory("user_unknown", { page: 1, limit: 10 }),
    /portfolio history not found/i,
  );
});

// ── updatePortfolio ───────────────────────────────────────────────────────────

test("updatePortfolio recomputes values but keeps identity fields stable", async () => {
  const service = createService();
  const before = await service.getPortfolio("user_1");
  const updated = await service.updatePortfolio("user_1");

  assert.equal(updated.data.id, before.data.id);
  assert.equal(updated.data.userId, "user_1");
  assert.ok(Date.parse(updated.data.updatedAt) >= Date.parse(before.data.updatedAt));
});

test("updatePortfolio rejects an unknown user", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(() => service.updatePortfolio("user_unknown"), /portfolio not found/i);
});

// ── addAsset ──────────────────────────────────────────────────────────────────

test("addAsset appends the new asset and recomputes totalValue as the sum of asset values", async () => {
  const service = createService();
  const updated = await service.addAsset("user_1", {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 1,
  });

  const added = updated.data.assets.find((a) => a.symbol === "BTC");
  assert.ok(added, "expected the new asset to be present");
  assert.equal(added?.value, 1);

  const expectedTotal = updated.data.assets.reduce((sum, a) => sum + a.value, 0);
  assert.equal(updated.data.totalValue, expectedTotal);
});

test("addAsset rejects an unknown user", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.addAsset("user_unknown", { symbol: "BTC", name: "Bitcoin", balance: 1 }),
    /portfolio not found/i,
  );
});

// ── removeAsset ───────────────────────────────────────────────────────────────

test("removeAsset removes the matching asset and recomputes totalValue", async () => {
  const service = createService();
  const before = await service.getPortfolio("user_1");
  const target = before.data.assets[0];

  const updated = await service.removeAsset("user_1", target.id);

  assert.equal(updated.data.assets.some((a) => a.id === target.id), false);
  const expectedTotal = updated.data.assets.reduce((sum, a) => sum + a.value, 0);
  assert.equal(updated.data.totalValue, expectedTotal);
});

test("removeAsset rejects an unknown asset id", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.removeAsset("user_1", "asset_does_not_exist"),
    /asset not found/i,
  );
});

test("removeAsset rejects an unknown user", async () => {
  const service = createService();
  await assertRejectsWithOriginalMessage(
    () => service.removeAsset("user_unknown", "asset_1"),
    /portfolio not found/i,
  );
});
