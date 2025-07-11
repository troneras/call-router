import { it, describe, beforeEach, afterEach, expect } from "bun:test";
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

    expect(response.statusCode).toBe(200);

    const payload = JSON.parse(response.payload);
    expect(payload.hello).toBe("world");
    expect(payload.message).toBe("Call Router API");
  });

  it("Should return health check status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });
    
    // Health check can return 200 or 500 depending on database availability
    expect([200, 500]).toContain(response.statusCode);

    const payload = JSON.parse(response.payload);
    expect(payload.status).toBeTruthy();
    expect(payload.database).toBeTruthy();
  });

  it("Should return 404 for non-existent routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/non-existent",
    });

    expect(response.statusCode).toBe(404);

    const payload = JSON.parse(response.payload);
    expect(payload.message).toBe("Not Found");
  });
});