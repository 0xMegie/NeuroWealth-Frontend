import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "src", "app", "api");

async function collectRouteFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectRouteFiles(full)));
    } else if (entry.isFile() && entry.name === "route.ts") {
      results.push(full);
    }
  }

  return results;
}

// Routes that are intentionally public (do not call requireAuth).
const PUBLIC_ALLOWLIST = new Set<string>([
  // Example: path.join("src", "app", "api", "public", "route.ts")
]);

test("API route handlers call requireAuth or are explicitly allowlisted", async () => {
  const files = await collectRouteFiles(API_DIR);
  assert.ok(files.length > 0, "no route.ts files found under src/app/api — check paths");

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (PUBLIC_ALLOWLIST.has(rel)) continue;

    const content = await fs.readFile(file, "utf8");
    assert.ok(
      content.includes("requireAuth(") || content.includes("requireAuth "),
      `Route ${rel} should call requireAuth or be added to PUBLIC_ALLOWLIST`
    );
  }
});
