import {
  SafeOnRampClient,
  StripeSession,
  SafeOnRampOpenOptions,
  StripeProviderConfig,
  SafeOnRampEventHandlers,
  SafeOnRampEvent,
  OnrampSessionUpdatedEvent
} from '../../types'

import * as stripeApi from './stripeApi'

import { loadScript } from './utils'

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'
const STRIPE_CRYPTO_JS_URL = 'https://crypto-js.stripe.com/crypto-onramp-outer.js'

/**
 * This class implements the SafeOnRampClient interface for the Stripe provider
 * @class StripeAdapter
 */
export default class StripeAdapter implements SafeOnRampClient {
  private stripeOnRamp: any
  private onRampSession?: StripeSession
  private config: StripeProviderConfig
  private currentSessionOptions?: SafeOnRampOpenOptions

  /**
   * Initialize the StripeAdapter
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
      let response

      if (options.sessionId) {
        response = await stripeApi.getSession(this.config.onRampBackendUrl, options.sessionId)
      } else {
        response = await stripeApi.createSession(this.config.onRampBackendUrl, {
          walletAddress: options.walletAddress,
          networks: options.networks
        })
      }

      const data = await response.json()

      if (!response.ok) throw new Error()

      const onRampSession = await this.stripeOnRamp.createSession({
        clientSecret: data.client_secret
      })

      this.onRampSession = onRampSession
      this.currentSessionOptions = options

      if (options.events) this.bindEvents(options.events)

      onRampSession.mount(options.element)

      return data
    } catch {
      throw new Error('Error trying to create a new Stripe session')
    }
  }

  /**
   * This method close the onramp widget
   */
  async close() {
    throw new Error('Method not implemented.')
  }

  /**
   * This method binds the event handlers to the onramp widget
   * @param events The event handlers to bind to the onramp widget
   */
  private bindEvents(events: SafeOnRampEventHandlers) {
    this.onRampSession?.addEventListener('onramp_ui_loaded', () => {
      events?.onLoaded?.()
    })

    this.onRampSession?.addEventListener(
      'onramp_session_updated',
      (e: OnrampSessionUpdatedEvent) => {
        const safeEvent = this.stripeEventToSafeEvent(e)

        // TODO: Remove this check when not required
        // This is only in order to preserve testnets liquidity pools during the hackaton
        if (Number(e.payload.session.quote.source_monetary_amount) > 10) {
          document.querySelector(this?.currentSessionOptions?.element as string)?.remove()
          throw new Error(
            "The amount you are trying to use for complete your purchase can't be greater than 10 in order to preserve testnets liquidity pools"
          )
        }

        if (e.payload.session.status === 'fulfillment_complete') {
          events?.onPaymentSuccessful?.(safeEvent)
        }

        if (e.payload.session.status === 'fulfillment_processing') {
          events?.onPaymentProcessing?.(safeEvent)
        }

        if (e.payload.session.status === 'rejected') {
          events?.onPaymentError?.(safeEvent)
        }
      }
    )
  }

  private stripeEventToSafeEvent(stripeEvent: OnrampSessionUpdatedEvent): SafeOnRampEvent {
    const { session } = stripeEvent.payload
    const { quote } = session

    return {
      txId: quote.blockchain_tx_id,
      walletAddress: session.wallet_address,
      totalFee: quote.fees?.total_fee,
      totalAmount: quote.total_amount,
      destination: {
        asset: quote.destination_currency?.asset_code,
        amount: quote.destination_amount,
        network: quote.destination_currency?.currency_network
      },
      source: {
        asset: quote.source_currency?.asset_code,
        amount: quote.source_amount,
        network: quote.source_currency?.currency_network
      }
    }
  }
}
