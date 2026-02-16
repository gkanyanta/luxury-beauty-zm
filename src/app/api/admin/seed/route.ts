import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Temporary seed endpoint - remove after first use
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if already seeded
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (existingAdmin) {
      return NextResponse.json({ message: 'Database already seeded', admin: existingAdmin.email })
    }

    // Admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12)
    const admin = await prisma.user.create({
      data: { email: 'sales@luxurybeautyzm.com', name: 'Admin', password: adminPassword, role: 'ADMIN' },
    })

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
      { name: "Paula's Choice", slug: 'paulas-choice', description: 'Research-driven skincare' },
      { name: 'Versace', slug: 'versace', description: 'Italian luxury fashion and fragrances' },
      { name: 'YSL', slug: 'ysl', description: 'French luxury cosmetics and fragrances' },
    ]
    const brands: Record<string, any> = {}
    for (const b of brandsData) {
      brands[b.slug] = await prisma.brand.create({ data: b })
    }

    // Categories
    const categoriesData = [
      { name: 'Fragrances', slug: 'fragrances', description: 'Luxury and niche perfumes' },
      { name: 'K-Beauty', slug: 'k-beauty', description: 'Korean skincare and beauty' },
      { name: 'Skincare', slug: 'skincare', description: 'Premium UK & USA skincare brands' },
    ]
    const categories: Record<string, any> = {}
    for (const c of categoriesData) {
      categories[c.slug] = await prisma.category.create({ data: c })
    }

    // Products with images
    const productsData = [
      { name: 'Chanel No. 5 Eau de Parfum', slug: 'chanel-no-5-edp', description: 'The iconic fragrance that needs no introduction.', price: 2850, compareAtPrice: 3200, stockQty: 15, brandSlug: 'chanel', catSlug: 'fragrances', featured: true },
      { name: 'Tom Ford Oud Wood', slug: 'tom-ford-oud-wood', description: 'Exotic rosewood, cardamom, and Chinese pepper.', price: 4500, stockQty: 8, brandSlug: 'tom-ford', catSlug: 'fragrances', featured: true },
      { name: 'Creed Aventus', slug: 'creed-aventus', description: 'Sophisticated fruity fragrance. Bold, powerful, confident.', price: 5200, stockQty: 6, brandSlug: 'creed', catSlug: 'fragrances', featured: true },
      { name: 'Dior Sauvage Eau de Parfum', slug: 'dior-sauvage-edp', description: 'Bold and juicy reinterpretation of the Sauvage accord.', price: 2200, compareAtPrice: 2500, stockQty: 20, brandSlug: 'dior', catSlug: 'fragrances', featured: false },
      { name: 'Byredo Gypsy Water', slug: 'byredo-gypsy-water', description: 'Romantic conception with fresh, woody notes.', price: 3800, stockQty: 5, brandSlug: 'byredo', catSlug: 'fragrances', featured: false },
      { name: 'Versace Eros', slug: 'versace-eros', description: 'Fresh mint, green apple, and Italian lemon.', price: 1650, compareAtPrice: 1900, stockQty: 25, brandSlug: 'versace', catSlug: 'fragrances', featured: false },
      { name: 'COSRX Advanced Snail 96 Mucin Power Essence', slug: 'cosrx-snail-96-mucin-essence', description: 'Lightweight hydrating essence with 96% snail secretion filtrate.', price: 380, compareAtPrice: 450, stockQty: 40, brandSlug: 'cosrx', catSlug: 'k-beauty', featured: true },
      { name: 'Anua Heartleaf 77% Soothing Toner', slug: 'anua-heartleaf-77-toner', description: 'Gentle pH-balancing toner with 77% Heartleaf extract.', price: 350, stockQty: 35, brandSlug: 'anua', catSlug: 'k-beauty', featured: true },
      { name: 'Beauty of Joseon Glow Serum', slug: 'beauty-of-joseon-glow-serum', description: 'Glow-boosting serum with Propolis and Niacinamide.', price: 320, stockQty: 30, brandSlug: 'beauty-of-joseon', catSlug: 'k-beauty', featured: false },
      { name: 'SKIN1004 Madagascar Centella Ampoule', slug: 'skin1004-centella-ampoule', description: 'Calming ampoule with pure Madagascar Centella Asiatica.', price: 340, stockQty: 25, brandSlug: 'skin1004', catSlug: 'k-beauty', featured: false },
      { name: 'COSRX BHA Blackhead Power Liquid', slug: 'cosrx-bha-blackhead-power-liquid', description: 'Gentle chemical exfoliant with natural BHA.', price: 360, stockQty: 30, brandSlug: 'cosrx', catSlug: 'k-beauty', featured: false },
      { name: 'CeraVe Moisturizing Cream', slug: 'cerave-moisturizing-cream', description: 'Rich moisturizing cream with 3 essential ceramides.', price: 280, compareAtPrice: 320, stockQty: 50, brandSlug: 'cerave', catSlug: 'skincare', featured: true },
      { name: 'The Ordinary Niacinamide 10% + Zinc 1%', slug: 'the-ordinary-niacinamide-10-zinc-1', description: 'High-strength blemish formula.', price: 180, stockQty: 45, brandSlug: 'the-ordinary', catSlug: 'skincare', featured: false },
      { name: 'La Roche-Posay Effaclar Duo+', slug: 'la-roche-posay-effaclar-duo-plus', description: 'Anti-imperfection moisturizer for blemish-prone skin.', price: 420, stockQty: 20, brandSlug: 'la-roche-posay', catSlug: 'skincare', featured: false },
      { name: "Paula's Choice 2% BHA Liquid Exfoliant", slug: 'paulas-choice-2-bha-liquid-exfoliant', description: 'Cult-favorite leave-on exfoliant with salicylic acid.', price: 520, stockQty: 15, brandSlug: 'paulas-choice', catSlug: 'skincare', featured: true },
      { name: 'CeraVe Hydrating Facial Cleanser', slug: 'cerave-hydrating-cleanser', description: 'Gentle non-foaming cleanser with ceramides.', price: 240, stockQty: 40, brandSlug: 'cerave', catSlug: 'skincare', featured: false },
    ]

    const placeholders: Record<string, string> = {
      fragrances: '/placeholders/fragrance.svg',
      'k-beauty': '/placeholders/kbeauty.svg',
      skincare: '/placeholders/skincare.svg',
    }

    for (const p of productsData) {
      const product = await prisma.product.create({
        data: {
          name: p.name, slug: p.slug, description: p.description,
          price: p.price, compareAtPrice: p.compareAtPrice || null,
          stockQty: p.stockQty, status: 'ACTIVE', featured: p.featured || false,
          brandId: brands[p.brandSlug].id, categoryId: categories[p.catSlug].id,
        },
      })
      await prisma.productImage.create({
        data: { productId: product.id, url: placeholders[p.catSlug], alt: p.name, sortOrder: 0, isPrimary: true },
      })
    }

    // Shipping rates
    await prisma.shippingRate.createMany({
      data: [
        { region: 'LUSAKA', baseRate: 50, estimatedDaysMin: 1, estimatedDaysMax: 2, active: true },
        { region: 'COPPERBELT', baseRate: 80, estimatedDaysMin: 2, estimatedDaysMax: 3, active: true },
        { region: 'OTHER', baseRate: 120, estimatedDaysMin: 3, estimatedDaysMax: 5, active: true },
      ],
    })

    // Discount codes
    await prisma.discountCode.createMany({
      data: [
        { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minSpend: 200, maxUses: 100, startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000), active: true },
        { code: 'LUSAKA50', type: 'FLAT', value: 50, minSpend: 500, maxUses: 50, startDate: new Date(), endDate: new Date(Date.now() + 180 * 86400000), active: true },
      ],
    })

    // Store settings
    const settings = [
      { key: 'storeName', value: 'Luxury Beauty ZM' },
      { key: 'storeEmail', value: 'sales@luxurybeautyzm.com' },
      { key: 'storePhone', value: '+260 97 1234567' },
      { key: 'storeAddress', value: 'Lusaka, Zambia' },
      { key: 'whatsappNumber', value: '+260971234567' },
      { key: 'mobileMoneyInstructions', value: 'Send payment to:\nAirtel Money: 097XXXXXXX\nMTN MoMo: 096XXXXXXX\n\nAfter payment, send screenshot via WhatsApp.' },
    ]
    for (const s of settings) {
      await prisma.storeSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      admin: admin.email,
      products: productsData.length,
      brands: brandsData.length,
      categories: categoriesData.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
