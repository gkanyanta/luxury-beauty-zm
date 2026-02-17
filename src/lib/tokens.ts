import crypto from 'crypto'
import prisma from '@/lib/prisma'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  const identifier = `email-verify:${email}`
  const token = generateToken()
  const hashed = hashToken(token)

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({ where: { identifier } })

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashed,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })

  return token
}

export async function verifyEmailVerificationToken(email: string, token: string): Promise<boolean> {
  const identifier = `email-verify:${email}`
  const hashed = hashToken(token)

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: hashed },
  })

  if (!record || record.expires < new Date()) return false

  // Atomically delete token and set emailVerified
  await prisma.$transaction([
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: hashed } },
    }),
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
  ])

  return true
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const identifier = `password-reset:${email}`
  const token = generateToken()
  const hashed = hashToken(token)

  await prisma.verificationToken.deleteMany({ where: { identifier } })

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashed,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })

  return token
}

export async function verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
  const identifier = `password-reset:${email}`
  const hashed = hashToken(token)

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: hashed },
  })

  return !!record && record.expires >= new Date()
}

export async function consumePasswordResetToken(email: string, token: string): Promise<boolean> {
  const identifier = `password-reset:${email}`
  const hashed = hashToken(token)

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: hashed },
  })

  if (!record || record.expires < new Date()) return false

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token: hashed } },
  })

  return true
}
