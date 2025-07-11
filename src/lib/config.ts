import fastifyEnv from '@fastify/env'
import Fastify from 'fastify'
import type { Config } from '../plugins/external/env'

const schema = {
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

let cachedConfig: Config | null = null

export async function loadConfig(): Promise<Config> {
  if (cachedConfig) {
    return cachedConfig
  }

  const fastify = Fastify({ logger: false })
  
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  })

  cachedConfig = fastify.config
  await fastify.close()
  
  return cachedConfig
}