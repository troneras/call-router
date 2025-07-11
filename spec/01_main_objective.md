# Main Objective: Telnyx Webhook Handling Architecture

## Job 1: Setting Up the Architecture

**Objective:**
Design and set up a scalable, reliable system to handle Telnyx programmable call webhooks using background processing with Redis and BullMQ.

**Key Results:**

- Webhook ingestion endpoint is created and responds quickly to Telnyx.
- Webhook payloads are enqueued as jobs in Redis (BullMQ).
- A separate worker process consumes and processes jobs from the queue.
- Both API and worker connect to Railway-managed Redis and PostgreSQL.
- Project structure supports clear separation between API and worker logic.

**Deliverables:**

- Project structure updated for API and worker services
- Redis and BullMQ integrated (add to docker-compose for local testing as well)

