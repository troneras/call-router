import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createDb } from "../../db/config";

declare module "fastify" {
  export interface FastifyInstance {
    db: ReturnType<typeof createDb>;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const db = createDb(fastify.config.DATABASE_URL);
    fastify.decorate("db", db);

    fastify.addHook("onClose", async (instance) => {
      await instance.db.$client.end();
    });
  },
  { 
    name: "database",
    dependencies: ["env"]
  }
);