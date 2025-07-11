# Intermediary Objective: Prepare Schema and Test Infrastructure

## Job 2: Schema and Test Preparation

**Objective:**
Prepare and validate the environment schema and update test infrastructure for the fastify-env refactor.

**Key Results:**

- Create a new plugin (e.g., src/plugins/external/env.ts) to register fastify-env with the schema
- Ensure all required variables (DATABASE_URL, REDIS_URL, PORT, etc.) are included and have sensible defaults
- Update test helpers to inject config as needed for tests

**Deliverables:**

- env plugin with schema
- Updated test helper for config injection
