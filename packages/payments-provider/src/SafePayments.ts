import EventEmitter from 'events'
import StripeProvider from './providers/StripeProvider'
import type {
  StripeSession,
  SafePaymentEvents,
  SafePaymentsConfig,
  SafePaymentsClient,
  SafePaymentsOpenOptions
} from './types'

import { SafePaymentsProviderType } from './types'

export class SafePayments extends EventEmitter {
  private client: SafePaymentsClient
  private config: SafePaymentsConfig

  constructor(client: SafePaymentsClient, config: SafePaymentsConfig) {
    super()

    this.client = client
    this.config = config
  }

  static async initialize(providerType: SafePaymentsProviderType, config: SafePaymentsConfig) {
    switch (providerType) {
      case SafePaymentsProviderType.Stripe:
        const client = new StripeProvider(config.paymentsProviderConfig)

        await client.initialize()

        return new SafePayments(client, config)
      default:
        return
    }
  }

  async open(options: SafePaymentsOpenOptions): Promise<void> {
    await this.client.open(options)
  }

  destroy() {
    throw new Error('Method not implemented.')
  }

  subscribe(eventName: typeof SafePaymentEvents, listener: (...args: any[]) => void) {
    this.on(eventName.toString(), listener)
  }

  unsubscribe(eventName: typeof SafePaymentEvents, listener: (...args: any[]) => void) {
    this.off(eventName.toString(), listener)
  }
}
