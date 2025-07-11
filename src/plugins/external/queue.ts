import fastifyPlugin from 'fastify-plugin'
import { Queue } from 'bullmq'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    queue: {
      webhookQueue: Queue
    }
  }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  const redis = fastify.redis;

  // Create webhook processing queue
  const webhookQueue = new Queue('webhook-processing', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  })

  webhookQueue.on('error', (err) => {
    fastify.log.error({ err }, 'Webhook queue error')
  })

  webhookQueue.on('waiting', (job) => {
    fastify.log.info({ jobId: job.id }, 'Job waiting in webhook queue')
  })

  fastify.decorate('queue', {
    webhookQueue,
  })

  // Close queues when Fastify closes
  fastify.addHook('onClose', async () => {
    await webhookQueue.close()
  })
}, {
    name: "queue",
    dependencies: ["env", "redis"],
  }
);