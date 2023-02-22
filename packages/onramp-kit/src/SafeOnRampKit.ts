import StripeAdapter from './adapters/StripeAdapter'
import type { SafeOnRampConfig, SafeOnRampClient, SafeOnRampOpenOptions } from './types'

import { SafeOnRampProviderType } from './types'

export class SafeOnRampKit {
  private client: SafeOnRampClient

  constructor(client: SafeOnRampClient) {
    this.client = client
  }

  static async init(providerType: SafeOnRampProviderType, config: SafeOnRampConfig) {
    switch (providerType) {
      case SafeOnRampProviderType.Stripe:
        const client = new StripeAdapter(config.onRampProviderConfig)

        await client.init()

        return new SafeOnRampKit(client)
      default:
        return
    }
  }

  async open(options: SafeOnRampOpenOptions): Promise<void> {
    await this.client.open(options)
  }

  async destroy() {
    await this.client.destroy()
  }
}
