import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
})

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(9),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  compound: z.string().optional(),
  town: z.string().min(2),
  province: z.string().min(2),
})

export const checkoutSchema = z.object({
  email: z.email(),
  phone: z.string().min(9),
  address: addressSchema,
  paymentMethod: z.enum(['LENCO', 'PAY_ON_DELIVERY']),
  customerNotes: z.string().optional(),
  discountCode: z.string().optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
})

export const discountCodeSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(['PERCENTAGE', 'FLAT']),
  value: z.number().positive(),
  minSpend: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().default(true),
})

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const shippingRateSchema = z.object({
  region: z.enum(['LUSAKA', 'COPPERBELT', 'OTHER']),
  baseRate: z.number().positive(),
  estimatedDaysMin: z.number().int().positive(),
  estimatedDaysMax: z.number().int().positive(),
  active: z.boolean().default(true),
})
