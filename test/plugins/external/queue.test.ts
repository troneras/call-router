import { test, expect, beforeEach, afterEach } from 'bun:test'
import build from '../../helper.js'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeEach(async () => {
  app = await build()
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('should create webhook queue with correct configuration', async () => {
  expect(app.queue).toBeDefined()
  expect(app.queue.webhookQueue).toBeDefined()
  expect(app.queue.webhookQueue.name).toBe('webhook-processing')
})

test('should add job to webhook queue', async () => {
  const jobData = {
    eventType: 'call.initiated',
    eventId: 'test-event-123',
    payload: {
      data: {
        event_type: 'call.initiated',
        id: 'test-event-123',
        payload: {
          call_control_id: 'test-call-control-id',
          from: '+1234567890',
          to: '+0987654321'
        }
      }
    }
  }

  const job = await app.queue.webhookQueue.add('process-telnyx-webhook', jobData)

  expect(job).toBeDefined()
  expect(job.id).toBeDefined()
  expect(job.data).toEqual(jobData)
})

test('should add job with high priority for critical events', async () => {
  const jobData = {
    eventType: 'call.initiated',
    eventId: 'test-event-456',
    payload: {
      data: {
        event_type: 'call.initiated',
        id: 'test-event-456',
        payload: {
          call_control_id: 'test-call-control-id',
          from: '+1234567890',
          to: '+0987654321'
        }
      }
    }
  }

  const job = await app.queue.webhookQueue.add('process-telnyx-webhook', jobData, {
    priority: 10
  })

  expect(job).toBeDefined()
  expect(job.opts.priority).toBe(10)
})

test('should add job with medium priority for standard events', async () => {
  const jobData = {
    eventType: 'call.dtmf.received',
    eventId: 'test-event-789',
    payload: {
      data: {
        event_type: 'call.dtmf.received',
        id: 'test-event-789',
        payload: {
          call_control_id: 'test-call-control-id',
          digit: '1'
        }
      }
    }
  }

  const job = await app.queue.webhookQueue.add('process-telnyx-webhook', jobData, {
    priority: 5
  })

  expect(job).toBeDefined()
  expect(job.opts.priority).toBe(5)
})

test('should handle queue operations gracefully', async () => {
  // Test that queue operations don't throw errors
  const stats = await app.queue.webhookQueue.getWaiting()
  expect(Array.isArray(stats)).toBe(true)
})

test('should clean up completed jobs according to configuration', async () => {
  // Add a job and let it complete
  const jobData = {
    eventType: 'test.event',
    eventId: 'cleanup-test',
    payload: { test: 'data' }
  }

  await app.queue.webhookQueue.add('test-job', jobData)

  // Check that queue is configured to remove completed jobs
  const opts = app.queue.webhookQueue.opts
  expect(opts.defaultJobOptions?.removeOnComplete).toBe(100)
  expect(opts.defaultJobOptions?.removeOnFail).toBe(50)
})