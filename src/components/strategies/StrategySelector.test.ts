import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";

describe("StrategySelector confirm modal", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/components/strategies/StrategySelector.tsx"),
    "utf8",
  );

  test("uses the shared z-modal class instead of raw z-50", () => {
    assert.match(source, /className="fixed inset-0 z-modal flex items-center justify-center p-4"/);
    assert.doesNotMatch(source, /fixed inset-0 z-50/);
  });

  test("wires useFocusTrap so Tab cycles within the confirm dialog", () => {
    assert.match(source, /import \{ useFocusTrap \} from "@\/hooks\/useFocusTrap";/);
    assert.match(source, /const containerRef = useRef<HTMLDivElement>\(null\);/);
    assert.match(source, /useFocusTrap\(containerRef, true\);/);
    assert.match(source, /ref=\{containerRef\}/);
  });

  test("focus trap controller prevents Tab from escaping the container", () => {
    const focusTrapSource = fs.readFileSync(
      path.join(process.cwd(), "src/hooks/focusTrap.ts"),
      "utf8",
    );

    assert.match(focusTrapSource, /if \(e\.key !== "Tab"\) return;/);
    assert.match(focusTrapSource, /e\.preventDefault\(\);/);
    assert.match(focusTrapSource, /first\?\.focus\(\);/);
    assert.match(focusTrapSource, /last\?\.focus\(\);/);
  });
});
