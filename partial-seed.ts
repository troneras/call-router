import { db } from './src/db/config'
import { redirections } from './src/db/schema'

async function main() {
    console.log('Seeding database...')

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