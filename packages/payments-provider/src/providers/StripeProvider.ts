import {
  SafePaymentsClient,
  StripeProviderConfig,
  StripeSession,
  SafePaymentsOpenOptions
} from '../types'

import { loadScript } from '../utils'

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'
const STRIPE_CRYPTO_JS_URL = 'https://crypto-js.stripe.com/crypto-onramp-outer.js'

export default class StripeProvider implements SafePaymentsClient {
  private stripeOnRamp: any
  private onRampSession?: StripeSession
  private config: StripeProviderConfig

  constructor(config: StripeProviderConfig) {
    this.config = config
  }

  async initialize() {
    try {
      await loadScript(STRIPE_JS_URL)
      await loadScript(STRIPE_CRYPTO_JS_URL)

      this.stripeOnRamp = StripeOnramp(this.config.stripePublicKey)
    } catch {
      throw new Error("Couldn't load Stripe's JS files")
    }
  }

  async open(options: SafePaymentsOpenOptions) {
    try {
      const response = await fetch(
        `${this.config.safePaymentsBackendUrl}/api/v1/onramp/stripe/session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ walletAddress: options.walletAddress })
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error()

      const onRampSession = await this.stripeOnRamp.createSession({
        clientSecret: data.client_secret
      })

      onRampSession.mount(options.element)

      this.onRampSession = onRampSession
    } catch {
      throw new Error('Error trying to create a new Stripe session')
    }
  }
  async destroy() {
    throw new Error('Method not implemented.')
  }
}
