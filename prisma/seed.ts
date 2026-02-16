import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'sales@luxurybeautyzm.com' },
    update: {},
    create: {
      email: 'sales@luxurybeautyzm.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin user created:', admin.email)

  // Brands
  const brandsData = [
    { name: 'Chanel', slug: 'chanel', description: 'Iconic French luxury house' },
    { name: 'Dior', slug: 'dior', description: 'French luxury fashion and beauty' },
    { name: 'Tom Ford', slug: 'tom-ford', description: 'American luxury brand' },
    { name: 'Creed', slug: 'creed', description: 'Heritage French fragrance house' },
    { name: 'Byredo', slug: 'byredo', description: 'Swedish modern luxury perfumery' },
    { name: 'Le Labo', slug: 'le-labo', description: 'New York artisanal perfumery' },
    { name: 'COSRX', slug: 'cosrx', description: 'Korean skincare essentials' },
    { name: 'Anua', slug: 'anua', description: 'Korean gentle skincare' },
    { name: 'Beauty of Joseon', slug: 'beauty-of-joseon', description: 'Korean traditional beauty' },
    { name: 'SKIN1004', slug: 'skin1004', description: 'Korean centella skincare' },
    { name: 'CeraVe', slug: 'cerave', description: 'Dermatologist-developed skincare' },
    { name: 'The Ordinary', slug: 'the-ordinary', description: 'Clinical formulations at honest prices' },
    { name: 'La Roche-Posay', slug: 'la-roche-posay', description: 'French dermatological skincare' },
    { name: 'Paula\'s Choice', slug: 'paulas-choice', description: 'Research-driven skincare' },
    { name: 'Versace', slug: 'versace', description: 'Italian luxury fashion and fragrances' },
    { name: 'YSL', slug: 'ysl', description: 'French luxury cosmetics and fragrances' },
  ]

  const brands: Record<string, any> = {}
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    })
  }
  console.log(`${Object.keys(brands).length} brands created`)

  // Categories
  const categoriesData = [
    { name: 'Fragrances', slug: 'fragrances', description: 'Luxury and niche perfumes' },
    { name: 'K-Beauty', slug: 'k-beauty', description: 'Korean skincare and beauty' },
    { name: 'Skincare', slug: 'skincare', description: 'Premium UK & USA skincare brands' },
  ]

  const categories: Record<string, any> = {}
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }
  console.log(`${Object.keys(categories).length} categories created`)

  // Products
  const productsData = [
    // Fragrances
    {
      name: 'Chanel No. 5 Eau de Parfum',
      slug: 'chanel-no-5-edp',
      description: 'The iconic fragrance that needs no introduction. A rich, floral aldehyde that has defined elegance for over a century.',
      price: 2850,
      compareAtPrice: 3200,
      stockQty:15,
      brandId: brands['chanel'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '100ml',
      fragranceFamily: 'Floral Aldehyde',
      concentration: 'EDP',
      topNotes: 'Aldehydes, Ylang-Ylang, Neroli',
      middleNotes: 'Rose, Jasmine, Iris',
      baseNotes: 'Sandalwood, Vanilla, Vetiver',
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Tom Ford Oud Wood',
      slug: 'tom-ford-oud-wood',
      description: 'A composition of exotic rosewood, cardamom, and Chinese pepper with a smoky blend of oud wood, sandalwood, and vetiver.',
      price: 4500,
      stockQty:8,
      brandId: brands['tom-ford'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '100ml',
      fragranceFamily: 'Woody Oriental',
      concentration: 'EDP',
      topNotes: 'Rosewood, Cardamom, Chinese Pepper',
      middleNotes: 'Oud Wood, Sandalwood',
      baseNotes: 'Tonka Bean, Vetiver, Amber',
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Creed Aventus',
      slug: 'creed-aventus',
      description: 'A sophisticated fruity fragrance inspired by the dramatic life of a historic emperor. Bold, powerful, and confident.',
      price: 5200,
      stockQty:6,
      brandId: brands['creed'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '100ml',
      fragranceFamily: 'Fruity Chypre',
      concentration: 'EDP',
      topNotes: 'Pineapple, Bergamot, Black Currant, Apple',
      middleNotes: 'Birch, Patchouli, Moroccan Jasmine, Rose',
      baseNotes: 'Musk, Oak Moss, Ambergris, Vanilla',
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Dior Sauvage Eau de Parfum',
      slug: 'dior-sauvage-edp',
      description: 'A bold and juicy reinterpretation of the Sauvage accord with a new Oriental trail.',
      price: 2200,
      compareAtPrice: 2500,
      stockQty:20,
      brandId: brands['dior'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      featured: false,
      volume: '100ml',
      fragranceFamily: 'Aromatic Fougère',
      concentration: 'EDP',
      topNotes: 'Bergamot, Pepper',
      middleNotes: 'Lavender, Star Anise, Nutmeg',
      baseNotes: 'Ambroxan, Vanilla, Cedar',
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Byredo Gypsy Water',
      slug: 'byredo-gypsy-water',
      description: 'A romantic conception of the Romani lifestyle with fresh, woody notes. Evokes campfires and Nordic forests.',
      price: 3800,
      stockQty:5,
      brandId: brands['byredo'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      volume: '100ml',
      fragranceFamily: 'Aromatic Woody',
      concentration: 'EDP',
      topNotes: 'Bergamot, Lemon, Pepper',
      middleNotes: 'Incense, Pine Needle, Orris',
      baseNotes: 'Sandalwood, Vanilla, Amber',
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Versace Eros',
      slug: 'versace-eros',
      description: 'A fragrance for a strong, passionate man. Fresh mint, green apple, and Italian lemon with tonka bean and vanilla.',
      price: 1650,
      compareAtPrice: 1900,
      stockQty:25,
      brandId: brands['versace'].id,
      categoryId: categories['fragrances'].id,
      status: 'ACTIVE',
      volume: '100ml',
      fragranceFamily: 'Aromatic Fougère',
      concentration: 'EDT',
      topNotes: 'Mint, Green Apple, Lemon',
      middleNotes: 'Tonka Bean, Geranium, Ambroxan',
      baseNotes: 'Vanilla, Vetiver, Oak Moss, Cedarwood',
      authenticity: 'AUTHORIZED_RETAILER',
    },

    // K-Beauty
    {
      name: 'COSRX Advanced Snail 96 Mucin Power Essence',
      slug: 'cosrx-snail-96-mucin-essence',
      description: 'A lightweight, hydrating essence with 96% snail secretion filtrate. Repairs and hydrates damaged skin for a healthy, glowing complexion.',
      price: 380,
      compareAtPrice: 450,
      stockQty:40,
      brandId: brands['cosrx'].id,
      categoryId: categories['k-beauty'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '100ml',
      ingredients: 'Snail Secretion Filtrate (96%), Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Panthenol, Arginine, Allantoin, Ethyl Hexanediol, Sodium Polyacrylate, Carbomer, Phenoxyethanol',
      howToUse: 'After cleansing and toning, apply an appropriate amount onto face. Gently pat until fully absorbed.',
      skinTypes: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      concerns: ['hydration', 'dullness', 'fine lines', 'acne scars'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Anua Heartleaf 77% Soothing Toner',
      slug: 'anua-heartleaf-77-toner',
      description: 'A gentle, pH-balancing toner with 77% Heartleaf extract. Soothes irritated skin and helps control excess sebum.',
      price: 350,
      stockQty:35,
      brandId: brands['anua'].id,
      categoryId: categories['k-beauty'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '250ml',
      ingredients: 'Houttuynia Cordata Extract (77%), Water, Glycerin, Dipropylene Glycol, 1,2-Hexanediol, Betaine, Panthenol, Allantoin, Sodium Hyaluronate',
      howToUse: 'After cleansing, soak a cotton pad or your palms with toner and gently wipe or pat onto face.',
      skinTypes: ['oily', 'combination', 'sensitive', 'acne-prone'],
      concerns: ['redness', 'irritation', 'pores', 'excess oil'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Beauty of Joseon Glow Serum: Propolis + Niacinamide',
      slug: 'beauty-of-joseon-glow-serum',
      description: 'A glow-boosting serum with Propolis extract and Niacinamide to brighten and nourish skin.',
      price: 320,
      stockQty:30,
      brandId: brands['beauty-of-joseon'].id,
      categoryId: categories['k-beauty'].id,
      status: 'ACTIVE',
      volume: '30ml',
      ingredients: 'Propolis Extract (60%), Niacinamide (2%), Glycerin, Butylene Glycol, Water, 1,2-Hexanediol, Honey Extract',
      howToUse: 'After toning, apply 2-3 drops onto face. Pat gently until absorbed. Follow with moisturizer.',
      skinTypes: ['all', 'dry', 'dull'],
      concerns: ['dullness', 'uneven skin tone', 'hydration'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'SKIN1004 Madagascar Centella Ampoule',
      slug: 'skin1004-centella-ampoule',
      description: 'A calming ampoule with pure Madagascar Centella Asiatica extract. Soothes sensitive and irritated skin.',
      price: 340,
      stockQty:25,
      brandId: brands['skin1004'].id,
      categoryId: categories['k-beauty'].id,
      status: 'ACTIVE',
      volume: '100ml',
      skinTypes: ['sensitive', 'combination', 'oily'],
      concerns: ['redness', 'sensitivity', 'acne', 'irritation'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'COSRX BHA Blackhead Power Liquid',
      slug: 'cosrx-bha-blackhead-power-liquid',
      description: 'A gentle chemical exfoliant with natural BHA (Betaine Salicylate) to dissolve blackheads and refine pores.',
      price: 360,
      stockQty:30,
      brandId: brands['cosrx'].id,
      categoryId: categories['k-beauty'].id,
      status: 'ACTIVE',
      volume: '100ml',
      howToUse: 'After cleansing, apply to cotton pad and sweep over face. Wait 15-20 minutes before continuing with your routine.',
      skinTypes: ['oily', 'combination'],
      concerns: ['blackheads', 'pores', 'excess oil', 'texture'],
      authenticity: 'AUTHORIZED_RETAILER',
    },

    // Skincare (UK/USA)
    {
      name: 'CeraVe Moisturizing Cream',
      slug: 'cerave-moisturizing-cream',
      description: 'A rich, non-comedogenic moisturizing cream with 3 essential ceramides and hyaluronic acid. Developed with dermatologists.',
      price: 280,
      compareAtPrice: 320,
      stockQty:50,
      brandId: brands['cerave'].id,
      categoryId: categories['skincare'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '453g',
      ingredients: 'Aqua, Glycerin, Cetearyl Alcohol, Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin',
      howToUse: 'Apply liberally as often as needed to face and body.',
      skinTypes: ['dry', 'normal', 'sensitive'],
      concerns: ['dryness', 'eczema', 'barrier repair'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      slug: 'the-ordinary-niacinamide-10-zinc-1',
      description: 'A high-strength vitamin and mineral blemish formula to reduce the appearance of blemishes and congestion.',
      price: 180,
      stockQty:45,
      brandId: brands['the-ordinary'].id,
      categoryId: categories['skincare'].id,
      status: 'ACTIVE',
      featured: false,
      volume: '30ml',
      howToUse: 'Apply a few drops to face AM and PM before heavier creams.',
      skinTypes: ['oily', 'combination', 'acne-prone'],
      concerns: ['blemishes', 'pores', 'excess oil', 'texture'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'La Roche-Posay Effaclar Duo+',
      slug: 'la-roche-posay-effaclar-duo-plus',
      description: 'A targeted anti-imperfection moisturizer with Niacinamide, Piroctone Olamine, and LHA for blemish-prone skin.',
      price: 420,
      stockQty:20,
      brandId: brands['la-roche-posay'].id,
      categoryId: categories['skincare'].id,
      status: 'ACTIVE',
      volume: '40ml',
      skinTypes: ['oily', 'combination', 'acne-prone'],
      concerns: ['acne', 'blemishes', 'post-acne marks'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
      slug: 'paulas-choice-2-bha-liquid-exfoliant',
      description: 'A cult-favorite leave-on exfoliant with salicylic acid to unclog pores and smooth wrinkles.',
      price: 520,
      stockQty:15,
      brandId: brands['paulas-choice'].id,
      categoryId: categories['skincare'].id,
      status: 'ACTIVE',
      featured: true,
      volume: '118ml',
      howToUse: 'After cleansing, apply with cotton pad or fingertips. Do not rinse. For daytime, follow with SPF.',
      skinTypes: ['all', 'oily', 'combination'],
      concerns: ['blackheads', 'enlarged pores', 'wrinkles', 'dullness'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
    {
      name: 'CeraVe Hydrating Facial Cleanser',
      slug: 'cerave-hydrating-cleanser',
      description: 'A gentle, non-foaming cleanser with ceramides and hyaluronic acid that removes makeup and dirt without disrupting the skin barrier.',
      price: 240,
      stockQty:40,
      brandId: brands['cerave'].id,
      categoryId: categories['skincare'].id,
      status: 'ACTIVE',
      volume: '236ml',
      skinTypes: ['dry', 'normal', 'sensitive'],
      concerns: ['dryness', 'sensitivity', 'gentle cleansing'],
      authenticity: 'AUTHORIZED_RETAILER',
    },
  ]

  for (const p of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      // Transform seed fields to match schema
      const { volume, topNotes, middleNotes, baseNotes, authenticity, ingredients, ...rest } = p as any

      const data: any = { ...rest }

      // volume -> sizeML
      if (volume) {
        const ml = parseFloat(volume)
        if (!isNaN(ml)) data.sizeML = ml
      }

      // fragrance notes -> fragranceNotes Json
      if (topNotes || middleNotes || baseNotes) {
        data.fragranceNotes = {
          top: topNotes ? topNotes.split(', ') : [],
          middle: middleNotes ? middleNotes.split(', ') : [],
          base: baseNotes ? baseNotes.split(', ') : [],
        }
      }

      // authenticity -> authenticitySource
      if (authenticity) {
        data.authenticitySource = 'AUTHORIZED_DISTRIBUTOR'
      }

      // ingredients -> ingredientHighlights
      if (ingredients) {
        data.ingredientHighlights = ingredients.split(', ').slice(0, 10)
      }

      // Determine placeholder image based on category
      let placeholderImage = '/placeholder-product.svg'
      if (data.categoryId === categories['fragrances'].id) {
        placeholderImage = '/placeholders/fragrance.svg'
      } else if (data.categoryId === categories['k-beauty'].id) {
        placeholderImage = '/placeholders/kbeauty.svg'
      } else if (data.categoryId === categories['skincare'].id) {
        placeholderImage = '/placeholders/skincare.svg'
      }

      const product = await prisma.product.create({ data })

      // Create product image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: placeholderImage,
          alt: product.name,
          sortOrder: 0,
          isPrimary: true,
        },
      })
    }
  }
  console.log(`${productsData.length} products seeded`)

  // Shipping rates
  const shippingData = [
    { region: 'LUSAKA' as const, baseRate: 50, estimatedDaysMin: 1, estimatedDaysMax: 2, active: true },
    { region: 'COPPERBELT' as const, baseRate: 80, estimatedDaysMin: 2, estimatedDaysMax: 3, active: true },
    { region: 'OTHER' as const, baseRate: 120, estimatedDaysMin: 3, estimatedDaysMax: 5, active: true },
  ]

  for (const rate of shippingData) {
    const existing = await prisma.shippingRate.findFirst({ where: { region: rate.region } })
    if (!existing) {
      await prisma.shippingRate.create({ data: rate })
    }
  }
  console.log('Shipping rates created')

  // Discount codes
  const discountsData = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE' as const,
      value: 10,
      minSpend: 200,
      maxUses: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      code: 'LUSAKA50',
      type: 'FLAT' as const,
      value: 50,
      minSpend: 500,
      maxUses: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      active: true,
    },
  ]

  for (const d of discountsData) {
    const existing = await prisma.discountCode.findUnique({ where: { code: d.code } })
    if (!existing) {
      await prisma.discountCode.create({ data: d })
    }
  }
  console.log('Discount codes created')

  // Store settings
  const settingsData = [
    { key: 'storeName', value: 'Luxury Beauty ZM' },
    { key: 'storeEmail', value: 'hello@luxurybeautyzm.com' },
    { key: 'storePhone', value: '+260 97 1234567' },
    { key: 'storeAddress', value: 'Lusaka, Zambia' },
    { key: 'whatsappNumber', value: '+260971234567' },
    { key: 'mobileMoneyInstructions', value: 'Send payment to:\nAirtel Money: 097XXXXXXX\nMTN MoMo: 096XXXXXXX\n\nAfter payment, send screenshot via WhatsApp to +260 97 1234567 with your order number.' },
  ]

  for (const s of settingsData) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('Store settings created')

  console.log('\nSeed completed successfully!')
  console.log('Admin login: sales@luxurybeautyzm.com / Admin123!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
