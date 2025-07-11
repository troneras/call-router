import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {

  fastify.get("/", async (request, reply) => {
    try {
      const { users } = await import("../../db/schema.js");
      await fastify.db.select().from(users).limit(1);
      return { status: "healthy", database: "connected" };
    } catch (error) {
      reply.code(500);
      return { status: "unhealthy", database: "disconnected" };
    }
  });
}