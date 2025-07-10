import fastify from 'fastify'
import { db } from './src/db/config'
import { users, calls } from './src/db/schema'
import { eq } from 'drizzle-orm'

const server = fastify({ logger: true })

server.get('/', async (request, reply) => {
  return { hello: 'world', message: 'Call Router API' }
})

server.get('/health', async (request, reply) => {
  try {
    // Simple database health check
    await db.select().from(users).limit(1)
    return { status: 'healthy', database: 'connected' }
  } catch (error) {
    reply.code(500)
    return { status: 'unhealthy', database: 'disconnected' }
  }
})

server.get('/users', async (request, reply) => {
  try {
    const allUsers = await db.select().from(users)
    return { users: allUsers }
  } catch (error) {
    reply.code(500)
    return { error: 'Failed to fetch users' }
  }
})

server.get('/calls', async (request, reply) => {
  try {
    const allCalls = await db.select().from(calls)
    return { calls: allCalls }
  } catch (error) {
    reply.code(500)
    return { error: 'Failed to fetch calls' }
  }
})

const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()