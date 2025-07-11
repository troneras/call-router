import fastifyPlugin from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import type { FastifyInstance } from 'fastify'

export interface Config {
  DATABASE_URL: string
  REDIS_URL?: string
  REDIS_HOST?: string
  REDIS_PORT?: string
  REDIS_PASSWORD?: string
  REDIS_DB?: string
  PORT?: string
  LOG_LEVEL?: string
  FASTIFY_CLOSE_GRACE_DELAY?: string
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
  }
}

export const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    DATABASE_URL: {
      type: 'string',
      description: 'Database connection URL'
    },
    REDIS_URL: {
      type: 'string',
      description: 'Redis connection URL (optional if using individual Redis settings)'
    },
    REDIS_HOST: {
      type: 'string',
      default: 'localhost',
      description: 'Redis host'
    },
    REDIS_PORT: {
      type: 'string',
      default: '6379',
      description: 'Redis port'
    },
    REDIS_PASSWORD: {
      type: 'string',
      description: 'Redis password (optional)'
    },
    REDIS_DB: {
      type: 'string',
      default: '0',
      description: 'Redis database number'
    },
    PORT: {
      type: 'string',
      default: '3000',
      description: 'Server port'
    },
    LOG_LEVEL: {
      type: 'string',
      default: 'info',
      description: 'Log level'
    },
    FASTIFY_CLOSE_GRACE_DELAY: {
      type: 'string',
      default: '500',
      description: 'Fastify close grace delay in milliseconds'
    }
  }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  })
}, {
  name: 'env',
})