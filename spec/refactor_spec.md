# Refactor the current code to make it more maintainable

We want to follow best fastify practices

## Separate concerns to make testing easy

First, we are going to separate our application code from our server code

## Testing

Fastify comes with built-in support for fake HTTP injection thanks to light-my-request. Since we are also using bun, we have jest compatible methods "bun:test".
Visit https://bun.sh/docs/cli/test for more info on bun testing
Visit https://fastify.dev/docs/latest/Guides/Testing/ for fastify documentation in testing

## Plugins Folder (src/plugins/)

Plugins define behavior that is common to all the routes in your application. Authentication, caching, templates, and all the other cross cutting concerns should be handled by plugins placed in this folder.

Files in this folder are typically defined through the fastify-plugin module, making them non-encapsulated. They can define decorators and set hooks that will then be used in the rest of your application.

divide this folder into external and app.

- In external you would add things like the drizzle plugin, rate-limiting, corst etc.
- In app you would add application plugins like authorization, and have subfolders for entity specific plugins like for calls, you could have call-repository, call-webhook-manager etc

## Routes Folder

Routes define the pathways within your application. Fastify's structure supports the modular monolith approach, where your application is organized into distinct, self-contained modules. This facilitates easier scaling and future transition to a microservice architecture. Each module can evolve independently, and in the future, you might want to deploy some of these modules separately.

In this folder you should define all the routes that define the endpoints of your web application. Each service is a Fastify plugin, it is encapsulated (it can have its own independent plugins) and it is typically stored in a file; be careful to group your routes logically, e.g. all /users routes in a users.js file. We have added a root.js file for you with a '/' root added.

If a single file become too large, create a folder and add a index.js file there: this file must be a Fastify plugin, and it will be loaded automatically by the application. You can now add as many files as you want inside that folder. In this way you can create complex routes within a single monolith, and eventually extract them.

If you need to share functionality between routes, place that functionality into the plugins folder, and share it via decorators.

If you're a bit confused about using async/await to write routes, you would better take a look at Promise resolution for more details.

## Tasks

- REFACTOR index.ts
  CREATE app.ts with the application code
  CREATE server.ts with the server code
  UPDATE package json with the new structure

- Refactor into a plugin the database configuration
- REFACTOR into a plugin the routes and plugins, make use of fastifyAutoload

Good examples of best practices can be found on fastify demo repository maintained by the community here https://github.com/fastify/demo/tree/main

Example `server.ts`

```ts
/**
 * This file is here only to show you how to proceed if you would
 * like to run your application as a standalone executable.
 *
 * You can launch it with the command `npm run standalone`
 */

import Fastify from "fastify";
import fp from "fastify-plugin";

// Import library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";

// Import your application as a normal plugin.
import serviceApp from "./app.js";

/**
 * Do not use NODE_ENV to determine what logger (or any env related feature) to use
 * @see {@link https://www.youtube.com/watch?v=HMM7GJC5E2o}
 */
function getLoggerOptions() {
  // Only if the program is running in an interactive terminal
  if (process.stdout.isTTY) {
    return {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    };
  }

  return { level: process.env.LOG_LEVEL ?? "silent" };
}

const app = Fastify({
  logger: getLoggerOptions(),
  ajv: {
    customOptions: {
      coerceTypes: "array", // change type of data to match type keyword
      removeAdditional: "all", // Remove additional body properties
    },
  },
});

async function init() {
  // Register your application as a normal plugin.
  // fp must be used to override default error handler
  app.register(fp(serviceApp));

  // Delay is the number of milliseconds for the graceful close to finish
  closeWithGrace(
    { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY ?? 500 },
    async ({ err }) => {
      if (err != null) {
        app.log.error(err);
      }

      await app.close();
    }
  );

  await app.ready();

  try {
    // Start listening.
    await app.listen({ port: process.env.PORT ?? 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
```

Example app.ts:

```ts
/**
 * If you would like to turn your application into a standalone executable, look at server.js file
 */

import path from "node:path";
import fastifyAutoload from "@fastify/autoload";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

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
  delete opts.skipOverride; // This option only serves testing purpose
  // This loads all external plugins defined in plugins/external
  // those should be registered first as your application plugins might depend on them
  await fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "plugins/external"),
    options: { ...opts },
  });

  // This loads all your application plugins defined in plugins/app
  // those should be support plugins that are reused
  // through your application
  fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "plugins/app"),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts },
  });

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

  // An attacker could search for valid URLs if your 404 error handling is not rate limited.
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 3,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
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
    }
  );
}
```

Example `routes/api/users/index.ts`

```ts
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { UpdateCredentialsSchema } from "../../../schemas/users.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { usersRepository, passwordManager } = fastify;
  fastify.put(
    "/update-password",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "1 minute",
        },
      },
      schema: {
        body: UpdateCredentialsSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
          401: Type.Object({
            message: Type.String(),
          }),
        },
        tags: ["Users"],
      },
    },
    async function (request, reply) {
      const { newPassword, currentPassword } = request.body;
      const { email } = request.session.user;

      const user = await usersRepository.findByEmail(email);

      if (!user) {
        return reply.code(401).send({ message: "User does not exist." });
      }

      const isPasswordValid = await passwordManager.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return reply.code(401).send({ message: "Invalid current password." });
      }

      if (newPassword === currentPassword) {
        reply.status(400);
        return {
          message: "New password cannot be the same as the current password.",
        };
      }

      const hashedPassword = await passwordManager.hash(newPassword);
      await usersRepository.updatePassword(email, hashedPassword);

      return { message: "Password updated successfully" };
    }
  );
};

export default plugin;
```

Example `src/plugins/external/knex.ts`

```ts
import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import knex, { Knex } from "knex";

declare module "fastify" {
  export interface FastifyInstance {
    knex: Knex;
  }
}

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    client: "mysql2",
    connection: {
      host: fastify.config.MYSQL_HOST,
      user: fastify.config.MYSQL_USER,
      password: fastify.config.MYSQL_PASSWORD,
      database: fastify.config.MYSQL_DATABASE,
      port: Number(fastify.config.MYSQL_PORT),
    },
    pool: { min: 2, max: 10 },
  };
};

export default fp(
  async (fastify: FastifyInstance, opts) => {
    fastify.decorate("knex", knex(opts));

    fastify.addHook("onClose", async (instance) => {
      await instance.knex.destroy();
    });
  },
  { name: "knex" }
);
```

Example `src/plugins/app/authorization.ts

```ts
import fp from "fastify-plugin";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    verifyAccess: typeof verifyAccess;
    isModerator: typeof isModerator;
    isAdmin: typeof isAdmin;
  }
}

function verifyAccess(this: FastifyRequest, reply: FastifyReply, role: string) {
  if (!this.session.user.roles.includes(role)) {
    reply.status(403).send("You are not authorized to access this resource.");
  }
}

async function isModerator(this: FastifyRequest, reply: FastifyReply) {
  this.verifyAccess(reply, "moderator");
}

async function isAdmin(this: FastifyRequest, reply: FastifyReply) {
  this.verifyAccess(reply, "admin");
}

/**
 * The use of fastify-plugin is required to be able
 * to export the decorators to the outer scope
 *
 * @see {@link https://github.com/fastify/fastify-plugin}
 */
export default fp(
  async function (fastify) {
    fastify.decorateRequest("verifyAccess", verifyAccess);
    fastify.decorateRequest("isModerator", isModerator);
    fastify.decorateRequest("isAdmin", isAdmin);
  },
  // You should name your plugins if you want to avoid name collisions
  // and/or to perform dependency checks.
  { name: "authorization" }
);
```

Example `src/plugins/app/users/user-repository.ts`

```ts
import { FastifyInstance } from "fastify";
import { Knex } from "knex";
import fp from "fastify-plugin";
import { Auth } from "../../../schemas/auth.js";

declare module "fastify" {
  interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export function createUsersRepository(fastify: FastifyInstance) {
  const knex = fastify.knex;

  return {
    async findByEmail(email: string, trx?: Knex) {
      const user: Auth & { password: string } = await (trx ?? knex)("users")
        .select("id", "username", "password", "email")
        .where({ email })
        .first();

      return user;
    },

    async updatePassword(email: string, hashedPassword: string) {
      return knex("users")
        .update({ password: hashedPassword })
        .where({ email });
    },

    async findUserRolesByEmail(email: string, trx: Knex) {
      const roles: { name: string }[] = await trx("roles")
        .select("roles.name")
        .join("user_roles", "roles.id", "=", "user_roles.role_id")
        .join("users", "user_roles.user_id", "=", "users.id")
        .where("users.email", email);

      return roles;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance) {
    const repo = createUsersRepository(fastify);
    fastify.decorate("usersRepository", repo);
  },
  {
    name: "users-repository",
    dependencies: ["knex"],
  }
);
```

Example `src/routes/api/autohooks.ts`

```ts
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request, reply) => {
    if (request.url.startsWith("/api/auth/login")) {
      return;
    }

    if (!request.session.user) {
      reply.unauthorized("You must be authenticated to access this route.");
    }
  });
}
```

Example `src/routes/api/index.ts`

```ts
import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", ({ session, protocol, hostname }) => {
    return {
      message: `Hello ${session.user.username}! See documentation at ${protocol}://${hostname}/documentation`,
    };
  });
}
```

Example `src/routes/api/home.ts`

```ts
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async function () {
      return { message: "Welcome to the official fastify demo!" };
    }
  );
};

export default plugin;
```

Example test

```ts
"use strict";

const { test } = require("node:test");
const build = require("./app");

test('requests the "/" route', async (t) => {
  t.plan(1);
  const app = build();

  const response = await app.inject({
    method: "GET",
    url: "/",
  });
  t.assert.strictEqual(
    response.statusCode,
    200,
    "returns a status code of 200"
  );
});
```

> IMPORTANT: This only attempt to be examples to help you with the implementation.
