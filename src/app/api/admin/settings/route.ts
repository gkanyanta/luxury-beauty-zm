import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  await requireAdmin()
  const settings = await prisma.storeSetting.findMany()
  const result: Record<string, string> = {}
  settings.forEach(s => { result[s.key] = s.value })
  return NextResponse.json(result)
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  const body = await req.json()
  for (const [key, value] of Object.entries(body)) {
    await prisma.storeSetting.upsert({
      where: { key }, create: { key, value: String(value) }, update: { value: String(value) },
    })
  }
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE_SETTINGS', entity: 'StoreSetting', entityId: 'bulk' } })
  return NextResponse.json({ success: true })
}
