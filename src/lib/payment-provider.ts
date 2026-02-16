import crypto from 'crypto'

export interface PaymentVerifyResult {
  success: boolean
  pending: boolean
  reference: string
  amount: number
  currency: string
  rawPayload: any
}

export interface PaymentProvider {
  name: string
  generateReference(orderId: string): string
  verifyPayment(reference: string): Promise<PaymentVerifyResult>
  verifyWebhookSignature(payload: string, signature: string): boolean
}

export class LencoProvider implements PaymentProvider {
  name = 'LENCO'
  private baseUrl: string
  private secretKey: string

  constructor() {
    this.baseUrl = process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2'
    this.secretKey = process.env.LENCO_SECRET_KEY || ''
  }

  generateReference(orderId: string): string {
    return `LB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    const response = await fetch(
      `${this.baseUrl}/collections/status/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      }
    )

    const data = await response.json()
    const status = data.data?.status
    const success = status === 'successful'
    const pending = status === 'pending' || status === 'processing'

    return {
      success,
      pending,
      reference,
      amount: data.data?.amount || 0,
      currency: data.data?.currency || 'ZMW',
      rawPayload: data,
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey) return false
    // Lenco: HMAC key = SHA256 hash of the secret key, then HMAC-SHA512 the payload
    const hmacKey = crypto.createHash('sha256').update(this.secretKey).digest('hex')
    const hash = crypto.createHmac('sha512', hmacKey).update(payload).digest('hex')
    return hash === signature
  }

  async verify(reference: string) {
    return this.verifyPayment(reference)
  }
}

export function getPaymentProvider(name: string): PaymentProvider {
  switch (name) {
    case 'LENCO':
      return new LencoProvider()
    default:
      throw new Error(`Unknown payment provider: ${name}`)
  }
}
