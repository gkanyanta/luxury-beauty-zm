interface LencoPayConfig {
  publicKey: string
  reference: string
  amount: number
  currency?: string
  email: string
  firstName?: string
  lastName?: string
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
