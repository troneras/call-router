import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    try {
      const { redirections } = await import("../../../db/schema.js");
      const allRedirections = await fastify.db.select().from(redirections);
      return { redirections: allRedirections };
    } catch (error) {
      reply.code(500);
      return { error: "Failed to fetch redirections" };
    }
  });

  fastify.get("/:countryCode", async (request, reply) => {
    try {
      const { countryCode } = request.params as { countryCode: string };
      const { redirections } = await import("../../../db/schema.js");
      const countryRedirections = await fastify.db
        .select()
        .from(redirections)
        .where(eq(redirections.countryCode, countryCode.toUpperCase()));
      return { redirections: countryRedirections };
    } catch (error) {
      reply.code(500);
      return { error: "Failed to fetch redirections for country" };
    }
  });
}