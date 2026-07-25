/**
 * Unit tests for src/lib/sandbox-scenario.ts
 *
 * Covers:
 * - parseSandboxScenario: all valid scenarios, invalid values, edge cases
 * - isSandboxScenario: guard correctly distinguishes live from sandbox
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseSandboxScenario,
  isSandboxScenario,
} from "./sandbox-scenario";

describe("parseSandboxScenario", () => {
  it("returns 'empty' for the string 'empty'", () => {
    assert.equal(parseSandboxScenario("empty"), "empty");
  });

  it("returns 'loading' for the string 'loading'", () => {
    assert.equal(parseSandboxScenario("loading"), "loading");
  });

  it("returns 'partial-failure' for the string 'partial-failure'", () => {
    assert.equal(parseSandboxScenario("partial-failure"), "partial-failure");
  });

  it("returns 'timeout' for the string 'timeout'", () => {
    assert.equal(parseSandboxScenario("timeout"), "timeout");
  });

  it("returns 'live' for null", () => {
    assert.equal(parseSandboxScenario(null), "live");
  });

  it("returns 'live' for undefined", () => {
    assert.equal(parseSandboxScenario(undefined), "live");
  });

  it("returns 'live' for an empty string", () => {
    assert.equal(parseSandboxScenario(""), "live");
  });

  it("returns 'live' for an unknown string value", () => {
    assert.equal(parseSandboxScenario("unknown-scenario"), "live");
  });

  it("returns 'live' for a numeric-looking string", () => {
    assert.equal(parseSandboxScenario("123"), "live");
  });

  it("is case-sensitive — 'Empty' is not a valid scenario", () => {
    assert.equal(parseSandboxScenario("Empty"), "live");
  });

  it("is case-sensitive — 'LOADING' is not a valid scenario", () => {
    assert.equal(parseSandboxScenario("LOADING"), "live");
  });
});

describe("isSandboxScenario", () => {
  it("returns false for 'live'", () => {
    assert.equal(isSandboxScenario("live"), false);
  });

  it("returns true for 'empty'", () => {
    assert.equal(isSandboxScenario("empty"), true);
  });

  it("returns true for 'loading'", () => {
    assert.equal(isSandboxScenario("loading"), true);
  });

  it("returns true for 'partial-failure'", () => {
    assert.equal(isSandboxScenario("partial-failure"), true);
  });

  it("returns true for 'timeout'", () => {
    assert.equal(isSandboxScenario("timeout"), true);
  });

  it("parseSandboxScenario → isSandboxScenario round-trip: known values", () => {
    const sandboxValues = ["empty", "loading", "partial-failure", "timeout"];
    for (const v of sandboxValues) {
      assert.equal(
        isSandboxScenario(parseSandboxScenario(v)),
        true,
        `Expected isSandboxScenario to be true for '${v}'`,
      );
    }
  });

  it("parseSandboxScenario → isSandboxScenario round-trip: fallback values", () => {
    const fallbacks = [null, undefined, "", "live", "bad-value"];
    for (const v of fallbacks) {
      assert.equal(
        isSandboxScenario(parseSandboxScenario(v)),
        false,
        `Expected isSandboxScenario to be false for ${JSON.stringify(v)}`,
      );
    }
  });
});
