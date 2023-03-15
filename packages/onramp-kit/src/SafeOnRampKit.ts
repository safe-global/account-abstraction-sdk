import {
  SafeOnRampAdapter,
  SafeOnRampEvent,
  SafeOnRampEventListener,
  SafeOnRampOpenOptions,
  SafeOnRampOpenResponse
} from './types'

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
   * @param config The configuration object including the specific provider options
   * @returns A SafeOnRampKit instance
   * @throws Error if the adapter is not provided
   */
  static async init<T extends SafeOnRampAdapter<T>>(adapter: T): Promise<SafeOnRampKit<T>> {
    if (!adapter) {
      throw new Error('The adapter is not defined')
    }

    await adapter.init()
    return new this(adapter)
  }

  /**
   * This method opens the onramp widget using the provided options
   * @param options The options to open the onramp widget
   */
  async open(options?: SafeOnRampOpenOptions<TAdapter>): Promise<SafeOnRampOpenResponse<TAdapter>> {
    return await this.#adapter.open(options)
  }

  /**
   * This method destroys the onramp widget
   */
  async close() {
    await this.#adapter.close()
  }

  subscribe(event: SafeOnRampEvent<TAdapter>, handler: SafeOnRampEventListener<TAdapter>) {
    this.#adapter.subscribe(event, handler)
  }

  unsubscribe(event: SafeOnRampEvent<TAdapter>, handler: SafeOnRampEventListener<TAdapter>) {
    this.#adapter.unsubscribe(event, handler)
  }
}
