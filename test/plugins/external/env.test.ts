import { test, expect } from "bun:test";
import Fastify from "fastify";
import envPlugin, { schema } from "../../../src/plugins/external/env.ts";

test("env plugin validates required DATABASE_URL", async () => {
  const app = Fastify({ logger: false });

  // Clear DATABASE_URL to test validation
  const originalDbUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    // Register the plugin manually with dotenv: false
    await app.register(require("@fastify/env"), {
      schema,
      dotenv: false,
    });
    expect(true).toBe(false);
  } catch (error) {
    expect(error).toBeDefined();
    expect((error as Error).message).toContain("DATABASE_URL");
  } finally {
    if (originalDbUrl) {
      process.env.DATABASE_URL = originalDbUrl;
    }
    await app.close();
  }
});

test("env plugin accepts valid config", async () => {
  const app = Fastify({ logger: false });

  // Set required environment variable
  process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";

  try {
    await app.register(envPlugin);
    expect(app.config).toBeDefined();
    expect(app.config.DATABASE_URL).toBe("postgres://test:test@localhost:5432/test_db");
    expect(app.config.PORT).toBe("3000"); // Default value
    expect(app.config.LOG_LEVEL).toBe("info"); // Default value
  } finally {
    await app.close();
  }
});

test("env plugin uses defaults for optional config", async () => {
  const app = Fastify({ logger: false });

  // Set only required environment variable
  process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";

  try {
    await app.register(envPlugin);
    expect(app.config.REDIS_HOST).toBe("localhost");
    expect(app.config.REDIS_PORT).toBe("6379");
    expect(app.config.REDIS_DB).toBe("0");
    expect(app.config.FASTIFY_CLOSE_GRACE_DELAY).toBe("500");
  } finally {
    await app.close();
  }
});

test("env plugin accepts custom config values", async () => {
  const app = Fastify({ logger: false });

  // Set custom environment variables
  process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";
  process.env.REDIS_HOST = "custom-redis";
  process.env.REDIS_PORT = "6380";
  process.env.PORT = "8080";
  process.env.LOG_LEVEL = "debug";

  try {
    await app.register(envPlugin);
    expect(app.config.REDIS_HOST).toBe("custom-redis");
    expect(app.config.REDIS_PORT).toBe("6380");
    expect(app.config.PORT).toBe("8080");
    expect(app.config.LOG_LEVEL).toBe("debug");
  } finally {
    // Clean up
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.PORT;
    delete process.env.LOG_LEVEL;
    await app.close();
  }
});