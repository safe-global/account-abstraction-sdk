export type SafePaymentsConfig = {
  stripePublicKey: string
  safePaymentsBackendUrl: string
  mountElementSelector: string
}

export type StripeSession = {
  clientSecret: string
}
