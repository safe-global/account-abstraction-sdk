import { SafeOnRampEventHandlers } from './events'
import { StripeProviderConfig } from './stripe'

export interface SafeOnRampClient {
  init(): Promise<void>
  open(options: SafeOnRampOpenOptions): Promise<void>
  close(): Promise<void>
}

type Network = 'ethereum' | 'polygon'

export interface SafeOnRampOpenOptions {
  element: HTMLElement | string
  walletAddress: string
  networks: Network[]
  events?: SafeOnRampEventHandlers
}

export enum SafeOnRampProviderType {
  Stripe
}

export interface SafeOnRampConfig {
  onRampProviderConfig: StripeProviderConfig // Add other providers here when adapters are created
}
