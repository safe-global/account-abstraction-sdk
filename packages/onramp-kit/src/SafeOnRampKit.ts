import {
  SafeOnRampAdapter,
  SafeOnRampEvent,
  SafeOnRampEventListener,
  SafeOnRampOpenOptions
} from './types/onRamp'

/**
 * This class allows to initialize the Safe OnRamp Kit for convert fiat to crypto
 * @class SafeOnRampKit
 */
export class SafeOnRampKit<TAdapter extends SafeOnRampAdapter<TAdapter>> {
  #adapter: TAdapter

  /**
   * Initialize the SafeOnRampKit
   * @constructor
   * @param client - The client implementing the SafeOnRampClient interface
   */
  constructor(adapter: TAdapter) {
    this.#adapter = adapter
  }

  /**
   *
   * @param providerType The provider service to use. Currently only Stripe is supported
   * @param config The configuration object including the specific provider options
   * @returns A SafeOnRampKit instance
   * @throws Error if the provider type is not supported
   */
  static async init<TAdapter extends SafeOnRampAdapter<TAdapter>>(
    adapter: TAdapter
  ): Promise<SafeOnRampKit<TAdapter>> {
    await adapter.init()
    return new this(adapter)
  }

  /**
   * This method opens the onramp widget using the provided options
   * @param options The options to open the onramp widget
   */
  async open(options?: SafeOnRampOpenOptions<TAdapter>): Promise<unknown> {
    return await this.#adapter.open(options)
  }

  /**
   * This method destroys the onramp widget
   */
  async close() {
    await this.#adapter.close()
  }

  subscribe(event: SafeOnRampEvent, handler: SafeOnRampEventListener) {
    this.#adapter.subscribe(event, handler)
  }

  unsubscribe(event: SafeOnRampEvent, handler: SafeOnRampEventListener) {
    this.#adapter.unsubscribe(event, handler)
  }
}
