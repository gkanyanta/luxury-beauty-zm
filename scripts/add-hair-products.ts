import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('Adding hair care brands and products...')

  // Upsert brands
  const brandsData = [
    { name: 'Olaplex', slug: 'olaplex', description: 'Bond-building hair repair' },
    { name: 'Moroccanoil', slug: 'moroccanoil', description: 'Argan oil-infused hair care' },
    { name: 'Kérastase', slug: 'kerastase', description: 'Luxury professional hair care' },
    { name: 'Dyson', slug: 'dyson', description: 'High-performance hair styling tools' },
  ]

  const brands: Record<string, any> = {}
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    })
    console.log(`  Brand upserted: ${b.name}`)
  }

  // Ensure hair-products category exists
  const category = await prisma.category.upsert({
    where: { slug: 'hair-products' },
    update: {},
    create: {
      name: 'Hair Products',
      slug: 'hair-products',
      description: 'Professional hair care and styling',
    },
  })
  console.log(`  Category upserted: ${category.name}`)

  // Products
  const productsData = [
    {
      name: 'Olaplex No. 3 Hair Perfector',
      slug: 'olaplex-no-3-hair-perfector',
      description: 'A concentrated at-home treatment that reduces breakage and visibly strengthens hair by repairing damaged and compromised bonds. Suitable for all hair types.',
      price: 380,
      stockQty: 30,
      brandSlug: 'olaplex',
      volume: '100ml',
      ingredients: 'Bis-Aminopropyl Diglycol Dimaleate, Water, Cetearyl Alcohol, Behentrimonium Methosulfate, Cetyl Alcohol, Phenoxyethanol, Glycerin, Stearamidopropyl Dimethylamine',
      howToUse: 'Apply a generous amount to damp, towel-dried hair. Comb through and leave on for a minimum of 10 minutes. Rinse, then shampoo and condition.',
      skinTypes: ['straight', 'wavy', 'curly', 'coily'],
      concerns: ['damage repair', 'breakage', 'split ends', 'color-treated'],
    },
    {
      name: 'Moroccanoil Treatment Original',
      slug: 'moroccanoil-treatment-original',
      description: 'The iconic argan oil-infused hair treatment that started it all. A versatile styling, finishing, and conditioning tool for all hair types.',
      price: 450,
      stockQty: 25,
      brandSlug: 'moroccanoil',
      volume: '100ml',
      ingredients: 'Cyclomethicone, Dimethicone, Argania Spinosa (Argan) Kernel Oil, Linum Usitatissimum (Linseed) Seed Extract, Parfum, CI 26100, CI 47000',
      howToUse: 'Apply a small amount to clean, towel-dried hair from mid-length to ends. Style as desired. Can also be used on dry hair to tame flyaways and add shine.',
      skinTypes: ['straight', 'wavy', 'curly', 'coily'],
      concerns: ['frizz', 'dryness', 'dullness', 'manageability'],
    },
    {
      name: 'Kérastase Elixir Ultime Oil Serum',
      slug: 'kerastase-elixir-ultime-oil-serum',
      description: 'A luxurious beautifying hair oil serum enriched with Camellia oil and Argan oil. Delivers long-lasting shine, softness, and frizz protection.',
      price: 520,
      stockQty: 15,
      brandSlug: 'kerastase',
      volume: '100ml',
      ingredients: 'Cyclopentasiloxane, Dimethiconol, Argania Spinosa Kernel Oil, Camellia Oleifera Seed Oil, Zea Mays Germ Oil, Tocopherol, Parfum',
      howToUse: 'Apply 1-2 pumps to damp or dry hair. Distribute evenly from mid-lengths to ends. Do not rinse. Style as desired.',
      skinTypes: ['straight', 'wavy', 'curly'],
      concerns: ['frizz', 'dullness', 'dryness', 'lack of shine'],
    },
    {
      name: 'Olaplex No. 4 Bond Maintenance Shampoo',
      slug: 'olaplex-no-4-bond-maintenance-shampoo',
      description: 'A daily reparative shampoo that reduces breakage and strengthens all types of hair with patented OLAPLEX Bond Building Technology.',
      price: 350,
      stockQty: 35,
      brandSlug: 'olaplex',
      volume: '250ml',
      ingredients: 'Water, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Sodium Methyl Oleoyl Taurate, Bis-Aminopropyl Diglycol Dimaleate, Glycerin, Panthenol',
      howToUse: 'Apply to wet hair and massage into a lather. Rinse thoroughly. Follow with Olaplex No. 5 Bond Maintenance Conditioner.',
      skinTypes: ['straight', 'wavy', 'curly', 'coily'],
      concerns: ['damage repair', 'breakage', 'color-treated', 'strengthening'],
    },
    {
      name: 'Kérastase Resistance Bain Force Architecte',
      slug: 'kerastase-resistance-bain-force-architecte',
      description: 'A strengthening shampoo for damaged, over-processed hair. Reinforces hair fiber and restores substance to weakened hair.',
      price: 480,
      stockQty: 20,
      brandSlug: 'kerastase',
      volume: '250ml',
      ingredients: 'Water, Sodium Laureth Sulfate, Coco-Betaine, Glycerin, Glycol Distearate, Vita-Ciment, Ceramide R, Sap de Resurrection',
      howToUse: 'Apply to wet hair and gently massage into scalp. Rinse thoroughly. Follow with Resistance conditioner for best results.',
      skinTypes: ['straight', 'wavy', 'curly'],
      concerns: ['damage repair', 'breakage', 'strengthening', 'over-processed'],
    },
    {
      name: 'Dyson Supersonic Hair Dryer',
      slug: 'dyson-supersonic-hair-dryer',
      description: 'Engineered for fast drying with no extreme heat damage. Features intelligent heat control, multiple speed settings, and magnetic attachments for precision styling.',
      price: 8500,
      stockQty: 5,
      brandSlug: 'dyson',
      volume: '1 unit',
      featured: true,
      howToUse: 'Select your preferred heat and speed settings. Attach the desired styling nozzle magnetically. Hold 15cm from hair and dry in sections for best results.',
      skinTypes: ['straight', 'wavy', 'curly', 'coily'],
      concerns: ['heat damage', 'frizz', 'drying time', 'styling'],
    },
  ]

  for (const p of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`  Product already exists: ${p.name} — skipping`)
      continue
    }

    const { brandSlug, volume, ingredients, ...rest } = p

    const data: any = {
      ...rest,
      brandId: brands[brandSlug].id,
      categoryId: category.id,
      status: 'ACTIVE',
      authenticitySource: 'AUTHORIZED_DISTRIBUTOR',
    }

    // volume -> sizeML
    if (volume) {
      const ml = parseFloat(volume)
      if (!isNaN(ml)) data.sizeML = ml
    }

    // ingredients -> ingredientHighlights
    if (ingredients) {
      data.ingredientHighlights = ingredients.split(', ').slice(0, 10)
    }

    const product = await prisma.product.create({ data })

    // Create placeholder image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: '/placeholders/hair.svg',
        alt: product.name,
        sortOrder: 0,
        isPrimary: true,
      },
    })

    console.log(`  Product created: ${p.name} (K${p.price})`)
  }

  console.log('\nDone! 4 brands + 6 hair products added.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
