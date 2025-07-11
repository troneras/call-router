import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    try {
      const { users } = await import("../db/schema.js");
      const allUsers = await fastify.db.select().from(users);
      return { users: allUsers };
    } catch (error) {
      reply.code(500);
      return { error: "Failed to fetch users" };
    }
  });
}