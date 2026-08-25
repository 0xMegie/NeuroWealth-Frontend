import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bcp47ToAppLocale, appLocaleToBcp47Default } from "./locale-options";

describe("bcp47ToAppLocale", () => {
  it("maps en-based tags to the en app locale", () => {
    assert.equal(bcp47ToAppLocale("en-US"), "en");
    assert.equal(bcp47ToAppLocale("en-GB"), "en");
  });

  it("maps fr-based tags to the fr app locale", () => {
    assert.equal(bcp47ToAppLocale("fr-FR"), "fr");
  });

  it("is case-insensitive on mixed-case input", () => {
    assert.equal(bcp47ToAppLocale("EN-us"), "en");
    assert.equal(bcp47ToAppLocale("Fr-FR"), "fr");
  });

  it("returns null for an unsupported base language", () => {
    assert.equal(bcp47ToAppLocale("ja-JP"), null);
  });
});

describe("appLocaleToBcp47Default", () => {
  it("returns the fallback BCP47 tag for each supported app locale", () => {
    assert.equal(appLocaleToBcp47Default("en"), "en-US");
    assert.equal(appLocaleToBcp47Default("fr"), "fr-FR");
  });
});
