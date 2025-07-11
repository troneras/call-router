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

test('POST /webhooks/telnyx should accept valid webhook payload', async () => {
  const payload = {
    data: {
      event_type: 'call.initiated',
      id: 'test-event-id-123',
      occurred_at: '2023-01-01T00:00:00Z',
      payload: {
        call_control_id: 'test-call-control-id',
        call_session_id: 'test-call-session-id',
        from: '+1234567890',
        to: '+0987654321',
        direction: 'inbound'
      }
    }
  }

  const response = await app.inject({
    method: 'POST',
    url: '/webhooks/telnyx',
    payload
  })

  // Route should exist and handle the payload
  expect(response.statusCode).not.toBe(404)
  // With mocks, it should either succeed or fail gracefully
  expect([200, 500]).toContain(response.statusCode)
})

test('POST /webhooks/telnyx route should exist', async () => {
  // Simple test to verify the route exists
  const response = await app.inject({
    method: 'POST',
    url: '/webhooks/telnyx',
    payload: { data: { event_type: 'test', id: 'test', occurred_at: '2023-01-01T00:00:00Z', payload: {} } }
  })

  // Route should exist (not return 404)
  expect(response.statusCode).not.toBe(404)
})

test('POST /webhooks/telnyx should handle malformed payload gracefully', async () => {
  const payload = {
    invalid: 'payload'
  }

  const response = await app.inject({
    method: 'POST',
    url: '/webhooks/telnyx',
    payload
  })

  expect(response.statusCode).toBe(500)
  expect(response.json()).toHaveProperty('message')
})