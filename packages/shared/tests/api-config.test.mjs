import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiBaseURL } from "../dist/api/config.js";
import { normalizeApiResponse } from "../dist/api/response.js";
import { parseApiError } from "../dist/lib/error.js";

test("uses configured API URL without trailing slashes", () => {
  assert.equal(
    resolveApiBaseURL(" https://api.example.com/// ", "production"),
    "https://api.example.com",
  );
});

test("uses localhost only outside production", () => {
  assert.equal(
    resolveApiBaseURL(undefined, "development"),
    "http://localhost:8000",
  );
  assert.equal(resolveApiBaseURL(undefined, "production"), "");
});

test("preserves backend success envelopes", () => {
  const envelope = { success: true, data: [{ id: "1" }], request_id: "req-1" };
  assert.deepEqual(normalizeApiResponse(envelope), envelope);
});

test("wraps raw FastAPI response bodies consistently", () => {
  assert.deepEqual(normalizeApiResponse([{ id: "1" }]), {
    data: [{ id: "1" }],
  });
});

test("identifies an API route missing from the backend", () => {
  const error = Object.assign(new Error("Not Found"), {
    statusCode: 404,
    code: "API_REQUEST_FAILED",
  });
  assert.equal(parseApiError(error).code, "API_ENDPOINT_UNAVAILABLE");
});
