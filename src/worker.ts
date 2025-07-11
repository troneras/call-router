import { Worker } from 'bullmq'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { webhookEvents, calls } from './db/schema.js'
import { loadConfig } from './lib/config.js'

async function init() {
  const config = await loadConfig()
  
  const client = postgres(config.DATABASE_URL)
  const db = drizzle(client)

  const redisConnection = {
    host: config.REDIS_HOST || 'localhost',
    port: parseInt(config.REDIS_PORT || '6379'),
    password: config.REDIS_PASSWORD,
    db: parseInt(config.REDIS_DB || '0'),
  }

  // Use Redis URL if provided, otherwise use individual connection params
  const connection = config.REDIS_URL 
    ? { 
        host: new URL(config.REDIS_URL).hostname,
        port: parseInt(new URL(config.REDIS_URL).port || '6379'),
        password: new URL(config.REDIS_URL).password || undefined,
        db: parseInt(new URL(config.REDIS_URL).pathname.slice(1) || '0'),
      }
    : redisConnection

  interface WebhookJobData {
    eventType: string
    eventId: string
    payload: any
  }

  const worker = new Worker<WebhookJobData>(
    'webhook-processing',
    async (job) => {
      const { eventType, eventId, payload } = job.data

      console.log(`Processing webhook event: ${eventType} (ID: ${eventId})`)

      try {
        // Process different event types
        switch (eventType) {
          case 'call.initiated':
            await handleCallInitiated(payload)
            break
          case 'call.answered':
            await handleCallAnswered(payload)
            break
          case 'call.hangup':
            await handleCallHangup(payload)
            break
          case 'call.bridged':
            await handleCallBridged(payload)
            break
          case 'call.dtmf.received':
            await handleDtmfReceived(payload)
            break
          case 'call.recording.saved':
            await handleRecordingSaved(payload)
            break
          default:
            console.log(`Unhandled event type: ${eventType}`)
        }

        // Mark webhook event as processed
        await db
          .update(webhookEvents)
          .set({ 
            processed: 'true',
            processedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(webhookEvents.eventType, eventType))

        console.log(`Successfully processed webhook event: ${eventType}`)
      } catch (error) {
        console.error(`Error processing webhook event ${eventType}:`, error)
        throw error // This will trigger a retry
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 3600, count: 50 },
    },
  );

  // Event handlers
  async function handleCallInitiated(payload: any) {
    const { call_control_id, call_session_id, from, to } = payload.payload
    
    console.log(`Call initiated from ${from} to ${to}`)
    
    // Update call record if exists, or create new one
    // This would typically involve looking up user by phone number
    // For now, we'll just log the event
  }

  async function handleCallAnswered(payload: any) {
    const { call_control_id, call_session_id } = payload.payload
    
    console.log(`Call answered: ${call_control_id}`)
    
    // Update call status to answered
    await db
      .update(calls)
      .set({ 
        status: 'answered',
        updatedAt: new Date()
      })
      .where(eq(calls.metadata, { call_control_id }))
  }

  async function handleCallHangup(payload: any) {
    const { call_control_id, call_session_id, hangup_cause } = payload.payload
    
    console.log(`Call ended: ${call_control_id}, cause: ${hangup_cause}`)
    
    // Update call status to ended
    await db
      .update(calls)
      .set({ 
        status: 'ended',
        updatedAt: new Date()
      })
      .where(eq(calls.metadata, { call_control_id }))
  }

  async function handleCallBridged(payload: any) {
    const { call_control_id, call_session_id } = payload.payload
    
    console.log(`Call bridged: ${call_control_id}`)
    
    // Update call status to bridged
    await db
      .update(calls)
      .set({ 
        status: 'bridged',
        updatedAt: new Date()
      })
      .where(eq(calls.metadata, { call_control_id }))
  }

  async function handleDtmfReceived(payload: any) {
    const { call_control_id, digit } = payload.payload
    
    console.log(`DTMF received: ${digit} on call ${call_control_id}`)
    
    // Handle DTMF input - could trigger call routing logic
  }

  async function handleRecordingSaved(payload: any) {
    const { call_control_id, recording_id, recording_url } = payload.payload
    
    console.log(`Recording saved: ${recording_id} for call ${call_control_id}`)
    
    // Store recording information
  }

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
  })

  worker.on('error', (err) => {
    console.error('Worker error:', err)
  })

  process.on('SIGINT', async () => {
    console.log('Shutting down worker...')
    await worker.close()
    await client.end()
    process.exit(0)
  })

  console.log('Webhook worker started and listening for jobs...')
}

init().catch(console.error)