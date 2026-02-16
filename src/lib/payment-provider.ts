export interface PaymentInitResult {
  reference: string
  checkoutUrl?: string
  token?: string
}

export interface PaymentVerifyResult {
  success: boolean
  reference: string
  amount: number
  currency: string
  rawPayload: any
}

export interface PaymentProvider {
  name: string
  initializePayment(params: {
    orderId: string
    amount: number
    currency: string
    email: string
    callbackUrl: string
  }): Promise<PaymentInitResult>
  verifyPayment(reference: string): Promise<PaymentVerifyResult>
  verifyWebhookSignature(payload: string, signature: string): boolean
}

export class LencoProvider implements PaymentProvider {
  name = 'LENCO'
  private baseUrl: string
  private secretKey: string
  private webhookSecret: string

  constructor() {
    this.baseUrl = process.env.LENCO_BASE_URL || 'https://api.lenco.co'
    this.secretKey = process.env.LENCO_SECRET_KEY || ''
    this.webhookSecret = process.env.LENCO_WEBHOOK_SECRET || ''
  }

  async initializePayment(params: {
    orderId: string
    amount: number
    currency: string
    email: string
    callbackUrl: string
  }): Promise<PaymentInitResult> {
    const reference = `LB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    const response = await fetch(`${this.baseUrl}/v1/transactions/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretKey}`,
      },
      body: JSON.stringify({
        amount: params.amount * 100,
        currency: params.currency,
        reference,
        email: params.email,
        callback_url: params.callbackUrl,
        metadata: { orderId: params.orderId },
      }),
    })

    const data = await response.json()

    return {
      reference,
      checkoutUrl: data.data?.authorization_url || data.data?.checkout_url,
      token: data.data?.access_code,
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    const response = await fetch(`${this.baseUrl}/v1/transactions/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${this.secretKey}` },
    })

    const data = await response.json()
    const success = data.data?.status === 'success'

    return {
      success,
      reference,
      amount: (data.data?.amount || 0) / 100,
      currency: data.data?.currency || 'ZMW',
      rawPayload: data,
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false
    const crypto = require('crypto')
    const hash = crypto.createHmac('sha512', this.webhookSecret).update(payload).digest('hex')
    return hash === signature
  }

  // Convenience aliases
  async initialize(params: Parameters<LencoProvider['initializePayment']>[0]) {
    return this.initializePayment(params)
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
