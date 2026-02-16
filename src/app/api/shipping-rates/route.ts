import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({ where: { active: true }, orderBy: { region: 'asc' } })
    return NextResponse.json(rates)
  } catch { return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 }) }
}
