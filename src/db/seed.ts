import { db } from './config'
import { users, calls, redirections } from './schema'

async function main() {
  console.log('Seeding database...')

  // Create sample users
  const sampleUsers = await db.insert(users).values([
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
    },
  ]).returning()

  if (!sampleUsers || sampleUsers.length === 0 || !sampleUsers[0] || !sampleUsers[1]) {
    throw new Error('Failed to create sample users')
  }

  console.log(`Created ${sampleUsers.length} users`)

  // Create sample calls
  const sampleCalls = await db.insert(calls).values([
    {
      userId: sampleUsers[0].id,
      phoneNumber: '+1-555-0123',
      status: 'completed',
      metadata: { duration: 120, quality: 'good' },
    },
    {
      userId: sampleUsers[1].id,
      phoneNumber: '+1-555-0456',
      status: 'pending',
      metadata: { priority: 'high' },
    },
  ]).returning()

  console.log(`Created ${sampleCalls.length} calls`)

  // Create redirections for Spain
  const spainRedirections = await db.insert(redirections).values([
    {
      countryCode: 'ES',
      countryName: 'Spain',
      redirectNumber: '+34941710723',
      isActive: 'true',
    },
    {
      countryCode: 'ES',
      countryName: 'Spain',
      redirectNumber: '+34941710717',
      isActive: 'true',
    },
  ]).returning()

  console.log(`Created ${spainRedirections.length} redirections for Spain`)
  console.log('Database seeded successfully!')

  process.exit(0)
}

main().catch((err) => {
  console.error('Seeding failed!')
  console.error(err)
  process.exit(1)
})