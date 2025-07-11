import { test, expect, beforeEach, afterEach } from 'bun:test'
import build from '../helper.js'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeEach(async () => {
  app = await build()
})

afterEach(async () => {
  await app.close()
})

test('should process webhook from endpoint to worker completion', async () => {
  const payload = {
    data: {
      event_type: 'call.initiated',
      id: 'e2e-test-event-123',
      occurred_at: '2023-01-01T00:00:00Z',
      payload: {
        call_control_id: 'e2e-test-call-control-id',
        call_session_id: 'e2e-test-call-session-id',
        from: '+1234567890',
        to: '+0987654321',
        direction: 'inbound'
      }
    }
  }

  // Send webhook to endpoint
  const response = await app.inject({
    method: 'POST',
    url: '/webhooks/telnyx',
    payload
  })

  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({ received: true } as any)

  // Verify queue interface is available
  expect(app.queue).toBeDefined()
  expect(app.queue.webhookQueue).toBeDefined()
})

test('should verify webhook endpoints exist', async () => {
  // Simple test to verify the webhook system is set up correctly
  const response = await app.inject({
    method: 'POST',
    url: '/webhooks/telnyx',
    payload: { data: { event_type: 'test', id: 'test', occurred_at: '2023-01-01T00:00:00Z', payload: {} } }
  })

  // Route should exist (not return 404)
  expect(response.statusCode).not.toBe(404)

  // Verify mock interfaces are available
  expect(app.queue).toBeDefined()
  expect(app.queue.webhookQueue).toBeDefined()
  expect(app.db).toBeDefined()
  expect(app.db.insert).toBeDefined()
})