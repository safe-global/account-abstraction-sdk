import StripeProvider from './providers/StripeProvider'
import type {
  StripeSession,
  SafePaymentEvents,
  SafePaymentsConfig,
  SafePaymentsClient,
  SafePaymentsOpenOptions
} from './types'

import { SafePaymentsProviderType } from './types'

export class SafePayments {
  private client: SafePaymentsClient

  constructor(client: SafePaymentsClient) {
    this.client = client
  }

  static async init(providerType: SafePaymentsProviderType, config: SafePaymentsConfig) {
    switch (providerType) {
      case SafePaymentsProviderType.Stripe:
        const client = new StripeProvider(config.paymentsProviderConfig)

        await client.init()

        return new SafePayments(client)
      default:
        return
    }
  }

  async open(options: SafePaymentsOpenOptions): Promise<void> {
    await this.client.open(options)
  }

  async destroy() {
    await this.client.destroy()
  }
}
