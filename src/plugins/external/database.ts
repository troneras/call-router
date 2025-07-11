import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { db } from "../../db/config.js";

declare module "fastify" {
  export interface FastifyInstance {
    db: typeof db;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.decorate("db", db);
  },
  { name: "database" }
);