export interface SafePaymentsClient {
  init(): Promise<void>
  open(options: SafePaymentsOpenOptions): Promise<void>
  destroy(): Promise<void>
}

type Network = 'ethereum' | 'polygon'

export type SafePaymentsOpenOptions = {
  element: HTMLElement | string
  walletAddress: string
  networks: Network[]
  events?: {
    onLoaded?: () => void
    onPaymentSuccessful?: () => void
    onPaymentError?: () => void
    onPaymentProcessing?: () => void
  }
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
  UI_LOADED: 'UI_LOADED',
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  PAYMENT_ERROR: 'PAYMENT_ERROR'
}
