export interface SafePaymentsClient {
  initialize(): Promise<void>
  open(options: SafePaymentsOpenOptions): Promise<void>
  destroy(): Promise<void>
}

export type SafePaymentsOpenOptions = {
  element: HTMLElement | string
  walletAddress: string
}

export enum SafePaymentsProviderType {
  Stripe
}

export type SafePaymentsConfig = {
  paymentsProviderConfig: StripeProviderConfig
}

export type StripeProviderConfig = {
  stripePublicKey: string
  safePaymentsBackendUrl: string
}

export type StripeSession = {
  mount: (element: string) => void
  addEventListener: (event: string, callback: () => void) => void
  removeEventListener: (event: string, callback: () => void) => void
}

export const SafePaymentEvents = {
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  PAYMENT_ERROR: 'PAYMENT_ERROR'
}
