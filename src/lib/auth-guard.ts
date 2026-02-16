import { auth } from './auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }
  return session
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }
  return session
}

export async function requireStaffOrAdmin() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    redirect('/auth/login')
  }
  return session
}

export async function getOptionalSession() {
  return await auth()
}
