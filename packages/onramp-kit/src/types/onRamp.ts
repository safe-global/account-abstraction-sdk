import { StripeAdapter } from 'packs/stripe/StripeAdapter'
import { StripeEvent, StripeEventListener, StripeOpenOptions, StripeProviderConfig } from './stripe'

export interface SafeOnRampAdapter<TAdapter> {
  init(): Promise<void>
  open(options?: SafeOnRampOpenOptions<TAdapter>): Promise<unknown>
  close(): Promise<void>
  subscribe(event: string, handler: (data: unknown) => void): void
  unsubscribe(event: string, handler: (data: unknown) => void): void
}

export type SafeOnRampAdapterType = StripeAdapter

export interface SafeOnRampConfig {
  onRampProviderConfig: StripeProviderConfig
}
export type SafeOnRampOpenOptions<T> = T extends StripeAdapter ? StripeOpenOptions : never

export type SafeOnRampEvent = StripeEvent
export type SafeOnRampEventListener = StripeEventListener
