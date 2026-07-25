import { JSDOM } from "jsdom";

let initialized = false;

export function setupDomGlobals() {
  if (initialized) return;
  initialized = true;

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });

  Object.defineProperty(globalThis, "window", { value: dom.window, writable: true, configurable: true });
  Object.defineProperty(globalThis, "document", { value: dom.window.document, writable: true, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, writable: true, configurable: true });
  Object.defineProperty(globalThis, "HTMLElement", { value: dom.window.HTMLElement, writable: true, configurable: true });
  Object.defineProperty(globalThis, "Node", { value: dom.window.Node, writable: true, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, writable: true, configurable: true });
  Object.defineProperty(globalThis, "MutationObserver", {
    value: dom.window.MutationObserver ||
      class { observe() {} disconnect() {} takeRecords() { return []; } },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "getComputedStyle", { value: dom.window.getComputedStyle, writable: true, configurable: true });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    value: (cb: FrameRequestCallback) => setTimeout(cb, 0),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    value: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
    writable: true,
    configurable: true,
  });
}
