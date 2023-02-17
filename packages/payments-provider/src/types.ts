export interface SafePaymentsClient {
  init(): Promise<void>
  open(options: SafePaymentsOpenOptions): Promise<void>
  destroy(): Promise<void>
}

type Network = 'ethereum' | 'polygon'

export interface EventHandlers {
  onLoaded?: (e: any) => void
  onPaymentSuccessful?: (e: any) => void
  onPaymentError?: (e: any) => void
  onPaymentProcessing?: (e: any) => void
}

export interface SafePaymentsOpenOptions {
  element: HTMLElement | string
  walletAddress: string
  networks: Network[]
  events?: EventHandlers
}

export enum SafePaymentsProviderType {
  Stripe
}

export interface SafePaymentsConfig {
  paymentsProviderConfig: StripeProviderConfig
}

export interface StripeProviderConfig {
  stripePublicKey: string
  safePaymentsBackendUrl: string
}

export interface StripeSession {
  mount: (element: string) => void
  addEventListener: (event: string, callback: (e: any) => void) => void
  removeEventListener: (event: string, callback: (e: any) => void) => void
}

export const SafePaymentEvents = {
  UI_LOADED: 'UI_LOADED',
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  PAYMENT_ERROR: 'PAYMENT_ERROR'
}
