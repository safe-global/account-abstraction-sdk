import { StripeAdapter } from './adapters/stripe/StripeAdapter'
import type { SafeOnRampConfig, SafeOnRampClient, SafeOnRampOpenOptions } from './types'

import { SafeOnRampProviderType } from './types/onRamp'

/**
 * This class allows to initialize the Safe OnRamp Kit for convert fiat to crypto
 * @class SafeOnRampKit
 */
export class SafeOnRampKit {
  #client: SafeOnRampClient

  /**
   * Initialize the SafeOnRampKit
   * @constructor
   * @param client - The client implementing the SafeOnRampClient interface
   */
  constructor(client: SafeOnRampClient) {
    this.#client = client
  }

  /**
   *
   * @param providerType The provider service to use. Currently only Stripe is supported
   * @param config The configuration object including the specific provider options
   * @returns A SafeOnRampKit instance
   * @throws Error if the provider type is not supported
   */
  static async init(providerType: SafeOnRampProviderType, config: SafeOnRampConfig) {
    let client

    switch (providerType) {
      case SafeOnRampProviderType.Stripe:
        client = new StripeAdapter(config.onRampProviderConfig)
        break
      default:
        throw new Error('Provider type not supported')
    }

    await client.init()

    return new SafeOnRampKit(client)
  }

  /**
   * This method opens the onramp widget using the provided options
   * @param options The options to open the onramp widget
   */
  async open(options: SafeOnRampOpenOptions): Promise<unknown> {
    return await this.#client.open(options)
  }

  /**
   * This method destroys the onramp widget
   */
  async close() {
    await this.#client.close()
  }
}
