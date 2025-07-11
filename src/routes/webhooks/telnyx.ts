import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { webhookEvents } from '../../db/schema.js'

interface TelnyxWebhookPayload {
  data: {
    event_type: string
    id: string
    occurred_at: string
    payload: {
      call_control_id?: string
      call_session_id?: string
      [key: string]: any
    }
  }
}

export default async function telnyxWebhookRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: TelnyxWebhookPayload
  }>('/telnyx', async (request: FastifyRequest<{ Body: TelnyxWebhookPayload }>, reply: FastifyReply) => {
    const { data } = request.body

    try {
      // Store webhook event in database
      await fastify.db.insert(webhookEvents).values({
        eventType: data.event_type,
        callControlId: data.payload.call_control_id,
        callSessionId: data.payload.call_session_id,
        payload: data,
        processed: 'false',
      })

      // Add job to queue for processing
      await fastify.queue.webhookQueue.add(
        'process-telnyx-webhook',
        {
          eventType: data.event_type,
          eventId: data.id,
          payload: data,
        },
        {
          priority: getEventPriority(data.event_type),
          delay: 0,
        }
      )

      fastify.log.info(
        {
          eventType: data.event_type,
          eventId: data.id,
          callControlId: data.payload.call_control_id,
          callSessionId: data.payload.call_session_id,
        },
        'Telnyx webhook received and queued'
      )

      return reply.code(200).send({ received: true })
    } catch (error) {
      fastify.log.error(
        {
          error,
          eventType: data.event_type,
          eventId: data.id,
        },
        'Error processing Telnyx webhook'
      )

      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}

function getEventPriority(eventType: string): number {
  // Higher priority for call control events
  const highPriorityEvents = [
    'call.initiated',
    'call.answered',
    'call.hangup',
    'call.bridged',
    'call.recording.saved',
  ]

  const mediumPriorityEvents = [
    'call.dtmf.received',
    'call.playback.started',
    'call.playback.ended',
  ]

  if (highPriorityEvents.includes(eventType)) {
    return 10
  } else if (mediumPriorityEvents.includes(eventType)) {
    return 5
  } else {
    return 1
  }
}