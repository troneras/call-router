import fastifyAutoload from "@fastify/autoload";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

const __dirname = import.meta.dirname;

export const options = {
  ajv: {
    customOptions: {
      coerceTypes: "array",
      removeAdditional: "all",
    },
  },
};

export default async function serviceApp(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  delete opts.skipOverride;

  // Load external plugins first (database, etc.)
  await fastify.register(fastifyAutoload, {
    dir: `${__dirname}/plugins/external`,
    options: { ...opts },
    forceESM: true,
    matchFilter: (path) => path.endsWith('.ts') || path.endsWith('.js'),
  });

  // Load application plugins
  fastify.register(fastifyAutoload, {
    dir: `${__dirname}/plugins/app`,
    options: { ...opts },
    forceESM: true,
    matchFilter: (path) => path.endsWith('.ts') || path.endsWith('.js'),
  });

  // Load routes
  fastify.register(fastifyAutoload, {
    dir: `${__dirname}/routes`,
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts },
    forceESM: true,
    matchFilter: (path) => path.endsWith('.ts') || path.endsWith('.js'),
  });

  // Global error handler
  fastify.setErrorHandler((err, request, reply) => {
    fastify.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      "Unhandled error occurred"
    );

    reply.code(err.statusCode ?? 500);

    let message = "Internal Server Error";
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      "Resource not found"
    );

    reply.code(404);
    return { message: "Not Found" };
  });
}