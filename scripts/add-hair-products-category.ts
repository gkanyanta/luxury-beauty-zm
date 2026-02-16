import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: 'hair-products' },
    update: {},
    create: {
      name: 'Hair Products',
      slug: 'hair-products',
      description: 'Professional hair care and styling',
    },
  })
  console.log('Hair Products category upserted:', category.id)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
