# Main Objective: Refactor to fastify-env for Environment Management

## Job 1: Setup and Planning

**Objective:**
Refactor the codebase to use fastify-env for type-safe, validated, and centralized environment variable management, making configuration available to all plugins via Fastify's opts.config.

**Key Results:**

- Audit all current usages of process.env (DB, Redis, server, worker, etc.)
- Define a schema for all required environment variables using fastify-env
- Plan plugin registration order so fastify-env runs before any plugin needing config

**Deliverables:**

- List of all environment variables in use
- Draft of fastify-env schema
- Plan for plugin registration order
