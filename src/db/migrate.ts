import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { migrationClient, db } from './config'

async function main() {
  console.log('Running migrations...')
  console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not set')
  
  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' })
    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await migrationClient.end()
  }
  
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration script failed!')
  console.error(err)
  process.exit(1)
})