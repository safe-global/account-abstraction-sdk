import type { SafePaymentsConfig, StripeSession } from 'types'
import { loadScript } from './utils'

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'
const STRIPE_CRYPTO_JS_URL = 'https://crypto-js.stripe.com/crypto-onramp-outer.js'

export class SafePayments {
  private stripeOnRamp: any
  private config: SafePaymentsConfig

  constructor(stripeOnRamp: any, config: SafePaymentsConfig) {
    this.stripeOnRamp = stripeOnRamp
    this.config = config
  }

  static async initialize(config: SafePaymentsConfig) {
    let stripeOnramp: any

    try {
      await loadScript(STRIPE_JS_URL)
      await loadScript(STRIPE_CRYPTO_JS_URL)

      stripeOnramp = StripeOnramp(config.stripePublicKey)

      return new SafePayments(stripeOnramp, config)
    } catch {
      throw new Error("Couldn't load Stripe's JS files")
    }
  }

  async createSession(walletAddress: string) {
    try {
      const response = await fetch(`${this.config.safePaymentsBackendUrl}/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress })
      })

      const { clientSecret } = await response.json()

      if (!response.ok) throw new Error()

      const onRampSession = this.stripeOnRamp.createSession({ clientSecret })
      onRampSession.mount(this.config.mountElementSelector)
    } catch {
      throw new Error('Error trying to create a new Stripe session')
    }
  }
}
