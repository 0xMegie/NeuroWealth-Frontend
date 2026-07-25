import assert from "node:assert/strict";
import test from "node:test";

import { GET, PUT } from "./route";
import { NextRequest } from "next/server";
import { ERROR_CODE, HTTP_STATUS, MAX_BODY_BYTES } from "@/lib/api-response";

function makeGetRequest(cookieValue?: string): NextRequest {
  const url = "http://localhost:3000/api/strategy";
  const headers = new Headers();
  if (cookieValue) {
    headers.set("Cookie", `nw_strategy_preference=${cookieValue}`);
  }
  return new NextRequest(url, { headers });
}

function makePutRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("GET /api/strategy returns 200 with default strategy", async () => {
  const req = makeGetRequest();
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.hasOwnProperty("strategy"));
});

test("GET /api/strategy returns strategy from cookie", async () => {
  const req = makeGetRequest("growth");
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.strategy, "growth");
});

test("PUT /api/strategy returns 200 with valid strategy", async () => {
  const req = makePutRequest({ strategy: "balanced" });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.strategy, "balanced");
});

test("PUT /api/strategy returns 400 for invalid strategy", async () => {
  const req = makePutRequest({ strategy: "invalid" });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("PUT /api/strategy returns 400 for malformed JSON", async () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: "not-json",
  });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.VALIDATION_ERROR);
  assert.deepEqual(body.error.details, {
    body: ["Malformed JSON payload."],
  });
});

test("PUT /api/strategy returns 413 for oversized JSON body", async () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(MAX_BODY_BYTES + 1),
    },
    body: "{}",
  });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, HTTP_STATUS.PAYLOAD_TOO_LARGE);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.PAYLOAD_TOO_LARGE);
});

test("PUT /api/strategy accepts all valid strategy values", async () => {
  const strategies = ["conservative", "balanced", "growth"];

  for (const strategy of strategies) {
    const req = makePutRequest({ strategy });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, 200, `Strategy ${strategy} should return 200`);
    assert.equal(body.data.strategy, strategy, `Strategy should be ${strategy}`);
  }
});
