interface LencoPayConfig {
  key: string
  reference: string
  amount: number
  currency?: string
  email: string
  customer?: {
    firstName?: string
    lastName?: string
    phone?: string
  }
  onSuccess: (response: { reference: string; status: string }) => void
  onClose: () => void
  onConfirmationPending?: (response: { reference: string }) => void
}

interface LencoPayInstance {
  getPaid: (config: LencoPayConfig) => void
}

declare const LencoPay: LencoPayInstance

interface Window {
  LencoPay: LencoPayInstance
}
