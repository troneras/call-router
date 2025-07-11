import { it, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { build } from "../helper.js";
import type { FastifyInstance } from "fastify";

describe("Root routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await build();
  });

  afterEach(async () => {
    await app.close();
  });

  it("Should return hello world from root route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    assert.strictEqual(response.statusCode, 200);
    
    const payload = JSON.parse(response.payload);
    assert.strictEqual(payload.hello, "world");
    assert.strictEqual(payload.message, "Call Router API");
  });

  it("Should return health check status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    assert.strictEqual(response.statusCode, 200);
    
    const payload = JSON.parse(response.payload);
    assert.ok(payload.status);
    assert.ok(payload.database);
  });

  it("Should return 404 for non-existent routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/non-existent",
    });

    assert.strictEqual(response.statusCode, 404);
    
    const payload = JSON.parse(response.payload);
    assert.strictEqual(payload.message, "Not Found");
  });
});