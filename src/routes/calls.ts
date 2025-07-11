import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    try {
      const { calls } = await import("../db/schema.js");
      const allCalls = await fastify.db.select().from(calls);
      return { calls: allCalls };
    } catch (error) {
      reply.code(500);
      return { error: "Failed to fetch calls" };
    }
  });
}