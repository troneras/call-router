import type { FastifyInstance } from "fastify";
import { seed } from "../../db/seed";

export default async function (fastify: FastifyInstance) {

    fastify.get("/", async (request, reply) => {
        try {
            await seed();
            return { status: "seeded" };
        } catch (error) {
            reply.code(500);
            return { status: "unhealthy", database: "disconnected" };
        }
    });
}