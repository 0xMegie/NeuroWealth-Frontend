import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setActiveLocale, getActiveLocale, getActiveIntlLocale } from "./locale-state";

describe("locale-state", () => {
  beforeEach(() => {
    setActiveLocale("en");
  });

  describe("setActiveLocale and getActiveLocale", () => {
    it("starts with 'en' as default locale", () => {
      assert.equal(getActiveLocale(), "en");
    });

    it("updates activeLocale when setActiveLocale is called", () => {
      setActiveLocale("es");
      assert.equal(getActiveLocale(), "es");
    });

    it("supports multiple locale switches", () => {
      setActiveLocale("fr");
      assert.equal(getActiveLocale(), "fr");

      setActiveLocale("de");
      assert.equal(getActiveLocale(), "de");

      setActiveLocale("en");
      assert.equal(getActiveLocale(), "en");
    });
  });

  describe("getActiveIntlLocale", () => {
    it("returns 'en-US' for en locale", () => {
      setActiveLocale("en");
      assert.equal(getActiveIntlLocale(), "en-US");
    });

    it("returns correct intl locale for es", () => {
      setActiveLocale("es");
      assert.equal(getActiveIntlLocale(), "es-ES");
    });

    it("returns correct intl locale for fr", () => {
      setActiveLocale("fr");
      assert.equal(getActiveIntlLocale(), "fr-FR");
    });

    it("returns correct intl locale for de", () => {
      setActiveLocale("de");
      assert.equal(getActiveIntlLocale(), "de-DE");
    });

    it("reflects changes when locale is switched", () => {
      setActiveLocale("es");
      assert.equal(getActiveIntlLocale(), "es-ES");

      setActiveLocale("en");
      assert.equal(getActiveIntlLocale(), "en-US");
    });
  });
});
