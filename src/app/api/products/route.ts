import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const skinType = searchParams.get('skinType')
    const concern = searchParams.get('concern')
    const fragranceFamily = searchParams.get('fragranceFamily')
    const featured = searchParams.get('featured')

    const where: any = { status: 'ACTIVE' }
    if (category) where.category = { slug: category }
    if (brand) where.brand = { slug: brand }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (skinType) where.skinTypes = { has: skinType }
    if (concern) where.concerns = { has: concern }
    if (fragranceFamily) where.fragranceFamily = fragranceFamily
    if (featured === 'true') where.featured = true

    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'rating': orderBy = { avgRating: 'desc' }; break
      case 'popular': orderBy = { soldCount: 'desc' }; break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' }, take: 2 } },
        orderBy, skip: (page - 1) * limit, take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
