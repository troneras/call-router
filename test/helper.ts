import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import serviceApp from "../src/app.js";

export async function build(opts = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging during tests
    ...opts
  });
  
  await app.register(serviceApp, { skipOverride: true });
  
  return app;
}