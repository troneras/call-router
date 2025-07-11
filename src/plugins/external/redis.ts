import fastifyPlugin from 'fastify-plugin'
import Redis from 'ioredis'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  const redisUrl = fastify.config.REDIS_URL || 'redis://localhost:6379'

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  })

  redis.on('error', (err) => {
    fastify.log.error({ err }, 'Redis connection error')
  })

  redis.on('connect', () => {
    fastify.log.info('Redis connected')
  })

  redis.on('ready', () => {
    fastify.log.info('Redis ready')
  })

  redis.on('close', () => {
    fastify.log.info('Redis connection closed')
  })

  // Connect to Redis
  await redis.connect()

  // Register Redis instance
  fastify.decorate('redis', redis)

  // Close Redis connection when Fastify closes
  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
},
  {
    name: "redis",
    dependencies: ["env"],
  }
);