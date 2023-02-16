export type SafePaymentsConfig = {
  stripePublicKey: string
  safePaymentsBackendUrl: string
}

export type StripeSession = {
  mount: (element: string) => void
  addEventListener: (event: string, callback: () => void) => void
  removeEventListener: (event: string, callback: () => void) => void
}
