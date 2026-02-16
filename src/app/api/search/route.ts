import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json({ products: [] })
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { brand: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      take: 8,
    })
    return NextResponse.json({ products })
  } catch { return NextResponse.json({ products: [] }) }
}
