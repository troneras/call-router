import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    return { hello: "world", message: "Call Router API" };
  });
}