import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://dev:dev123@localhost:5432/call_router_dev'

// for migrations
export const migrationClient = postgres(connectionString, { max: 1 })

// for query purposes
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient)