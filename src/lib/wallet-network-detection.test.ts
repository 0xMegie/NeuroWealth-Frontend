import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { detectWalletNetworkMismatch } from "./wallet-network-detection";
import * as stellarWalletKit from "./stellar-wallet-kit";
import * as stellarNetwork from "./stellar-network";

test("detectWalletNetworkMismatch returns no mismatch for non-Freighter provider", async () => {
  const result = await detectWalletNetworkMismatch("some-other-provider");
  assert.equal(result.hasMismatch, false);
});

test("detectWalletNetworkMismatch returns no mismatch for undefined provider", async () => {
  const result = await detectWalletNetworkMismatch(undefined);
  assert.equal(result.hasMismatch, false);
});

test("detectWalletNetworkMismatch handles Freighter API returning undefined passphrase", async () => {
  mock.method(stellarWalletKit, "getFreighterNetworkPassphrase", async () => undefined);
  mock.method(stellarNetwork, "getConfiguredNetworkPassphrase", () => "Test SDF Network ; September 2015");
  mock.method(stellarNetwork, "formatConfiguredNetworkLabel", () => "Testnet");

  const result = await detectWalletNetworkMismatch(stellarWalletKit.FREIGHTER_ID);
  
  assert.equal(result.hasMismatch, false);
  assert.equal(result.appNetworkLabel, "Testnet");
  
  mock.restoreAll();
});

test("detectWalletNetworkMismatch returns mismatch when passphrases do not match", async () => {
  mock.method(stellarWalletKit, "getFreighterNetworkPassphrase", async () => "Public Global Stellar Network ; September 2015");
  mock.method(stellarNetwork, "getConfiguredNetworkPassphrase", () => "Test SDF Network ; September 2015");
  mock.method(stellarNetwork, "formatConfiguredNetworkLabel", () => "Testnet");
  mock.method(stellarNetwork, "networkPassphrasesMatch", () => false);

  const result = await detectWalletNetworkMismatch(stellarWalletKit.FREIGHTER_ID);
  
  assert.equal(result.hasMismatch, true);
  assert.equal(result.appNetworkLabel, "Testnet");
  assert.equal(result.walletNetworkLabel, "PUBLIC");
  assert.equal(result.walletPassphrase, "Public Global Stellar Network ; September 2015");

  mock.restoreAll();
});

test("detectWalletNetworkMismatch returns no mismatch when passphrases match", async () => {
  mock.method(stellarWalletKit, "getFreighterNetworkPassphrase", async () => "Test SDF Network ; September 2015");
  mock.method(stellarNetwork, "getConfiguredNetworkPassphrase", () => "Test SDF Network ; September 2015");
  mock.method(stellarNetwork, "formatConfiguredNetworkLabel", () => "Testnet");
  mock.method(stellarNetwork, "networkPassphrasesMatch", () => true);

  const result = await detectWalletNetworkMismatch(stellarWalletKit.FREIGHTER_ID);
  
  assert.equal(result.hasMismatch, false);
  assert.equal(result.appNetworkLabel, "Testnet");
  assert.equal(result.walletNetworkLabel, "TESTNET");
  assert.equal(result.walletPassphrase, "Test SDF Network ; September 2015");

  mock.restoreAll();
});

test("detectWalletNetworkMismatch handles Freighter API throwing", async () => {
  mock.method(stellarWalletKit, "getFreighterNetworkPassphrase", async () => {
    throw new Error("Freighter not installed");
  });
  
  try {
    await detectWalletNetworkMismatch(stellarWalletKit.FREIGHTER_ID);
    assert.fail("Should throw");
  } catch (e) {
    assert.equal(e instanceof Error, true);
    assert.equal((e as Error).message, "Freighter not installed");
  }
  
  mock.restoreAll();
});
