import {
  SafeOnRampClient,
  StripeProviderConfig,
  StripeSession,
  SafeOnRampOpenOptions,
  EventHandlers
} from '../types'

import { loadScript } from '../utils'

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'
const STRIPE_CRYPTO_JS_URL = 'https://crypto-js.stripe.com/crypto-onramp-outer.js'

/**
 * This class implements the SafeOnRampClient interface for the Stripe provider
 * @class StripeProvider
 */
export default class StripeProvider implements SafeOnRampClient {
  private stripeOnRamp: any
  private onRampSession?: StripeSession
  private config: StripeProviderConfig

  /**
   * Initialize the StripeProvider
   * @constructor
   * @param config The configuration object for the Stripe provider
   */
  constructor(config: StripeProviderConfig) {
    this.config = config
  }

  /**
   * This method loads the Stripe JS files and initializes the StripeOnRamp object
   */
  async init() {
    try {
      await loadScript(STRIPE_JS_URL)
      await loadScript(STRIPE_CRYPTO_JS_URL)

      this.stripeOnRamp = StripeOnramp(this.config.stripePublicKey)
    } catch {
      throw new Error("Couldn't load Stripe's JS files")
    }
  }

  /**
   * This method open the onramp widget with the provided options
   * @param options The options to open the onramp widget
   */
  async open(options: SafeOnRampOpenOptions) {
    try {
      const response = await fetch(`${this.config.onRampBackendUrl}/api/v1/onramp/stripe/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress: options.walletAddress, networks: options.networks })
      })

      const data = await response.json()

      if (!response.ok) throw new Error()

      const onRampSession = await this.stripeOnRamp.createSession({
        clientSecret: data.client_secret
      })

      this.onRampSession = onRampSession

      if (options.events) this.bindEvents(options.events)

      onRampSession.mount(options.element)
    } catch {
      throw new Error('Error trying to create a new Stripe session')
    }
  }

  /**
   * This method close the onramp widget
   */
  async close() {
    this.stripeOnRamp?.close()
  }

  /**
   * This method binds the event handlers to the onramp widget
   * @param events The event handlers to bind to the onramp widget
   */
  private bindEvents(events: EventHandlers) {
    this.onRampSession?.addEventListener('onramp_ui_loaded', (e: any) => {
      events?.onLoaded?.(e)
      console.log('onramp_ui_loaded', e)
    })

    this.onRampSession?.addEventListener('onramp_session_updated', (e: any) => {
      console.log('onramp_session_updated', e)

      if (e.payload.session.status === 'fulfillment_complete') {
        events?.onPaymentSuccessful?.(e)
      }

      if (e.payload.session.status === 'fulfillment_processing') {
        events?.onPaymentProcessing?.(e)
      }

      if (e.payload.session.status === 'rejected') {
        events?.onPaymentError?.(e)
      }
    })
  }
}
