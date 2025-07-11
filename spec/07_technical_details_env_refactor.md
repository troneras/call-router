# Technical Details: Implement fastify-env Refactor

## Job 3: Implementation

**Objective:**
Implement the fastify-env refactor across the codebase.

**Key Results:**

- Register the new env plugin as the first external plugin in serviceApp (src/app.ts)
- Refactor all plugins and files (database.ts, redis.ts, queue.ts, server.ts, worker.ts, etc.) to use opts.config instead of process.env
- Update the worker process to use the same config schema (can use a shared config module or minimal Fastify instance for env loading)
- Remove direct process.env usage from all business logic and plugins

**Deliverables:**

- Refactored plugins and entry points
- Shared config schema for worker and server
