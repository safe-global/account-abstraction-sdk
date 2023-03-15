import { loadStripeOnramp, OnrampSession, StripeOnramp } from '@stripe/crypto'
import * as stripeApi from './stripeApi'
import { getErrorMessage } from '../../lib/errors'

import type {
  StripeProviderConfig,
  StripeEvent,
  StripeEventListener,
  StripeOpenOptions
} from './types'
import type { SafeOnRampAdapter } from '../../types'

/**
 * This class implements the SafeOnRampClient interface for the Stripe provider
 * @class StripeAdapter
 */
export class StripeAdapter implements SafeOnRampAdapter<StripeAdapter> {
  #stripeOnRamp?: StripeOnramp
  #onRampSession?: OnrampSession
  #config: StripeProviderConfig

  /**
   * Initialize the StripeAdapter
   * @constructor
   * @param config The configuration object for the Stripe provider
   */
  constructor(config: StripeProviderConfig) {
    this.#config = config
  }

  /**
   * This method loads the Stripe JS files and initializes the StripeOnRamp object
   */
  async init() {
    try {
      this.#stripeOnRamp = (await loadStripeOnramp(this.#config.stripePublicKey)) || undefined
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  }

  /**
   * This method open the onramp widget with the provided options
   * @param options The options to open the onramp widget
   */
  async open({ element, theme = 'light', sessionId, defaultOptions }: StripeOpenOptions) {
    if (!this.#stripeOnRamp) throw new Error('StripeOnRamp is not initialized')

    try {
      let session

      if (sessionId) {
        session = await stripeApi.getSession(this.#config.onRampBackendUrl, sessionId)
      } else {
        session = await stripeApi.createSession(this.#config.onRampBackendUrl, defaultOptions)
      }

      const onRampSession = await this.#stripeOnRamp.createSession({
        clientSecret: session.client_secret,
        appearance: {
          theme: theme
        }
      })

      this.#onRampSession = onRampSession

      onRampSession.mount(element)

      return session
    } catch (e) {
      throw new Error(getErrorMessage(e))
    }
  }

  /**
   * This method close the onramp widget
   */
  async close() {
    throw new Error('Method not implemented.')
  }

  /**
   * Subscribe to an event
   * @param event The Stripe event to subscribe or '*' to subscribe to all events
   * @param handler The callback to execute when the event is triggered
   */
  subscribe(event: StripeEvent, handler: StripeEventListener): void {
    this.#onRampSession?.addEventListener(event as '*', handler)
  }

  /**
   * Unsubscribe from an event
   * @param event The Stripe event to unsubscribe or '*' to unsubscribe from all events
   * @param handler The callback to remove from the event
   */
  unsubscribe(event: StripeEvent, handler: StripeEventListener): void {
    this.#onRampSession?.removeEventListener(event as '*', handler)
  }

  /**
   * This method binds the event handlers to the onramp widget
   * @param events The event handlers to bind to the onramp widget
   */
  // #bindEvents(events: SafeOnRampEventHandlers) {
  //   this.#onRampSession?.addEventListener('onramp_ui_loaded', () => {
  //     events?.onLoaded?.()
  //   })

  //   this.#onRampSession?.addEventListener(
  //     'onramp_session_updated',
  //     (e: OnrampSessionUpdatedEvent) => {
  //       const safeEvent = this.stripeEventToSafeEvent(e)

  //       // TODO: Remove this check when not required
  //       // This is only in order to preserve testnets liquidity pools during the hackaton
  //       if (
  //         e.payload.session.quote &&
  //         Number(e.payload.session.quote.source_monetary_amount?.replace(',', '.')) > 10
  //       ) {
  //         document.querySelector(this.#currentSessionOptions?.element as string)?.remove()
  //         throw new Error(
  //           "The amount you are trying to use to complete your purchase can't be greater than 10 in order to preserve testnets liquidity pools"
  //         )
  //       }

  //       if (e.payload.session.status === 'fulfillment_complete') {
  //         events?.onPaymentSuccessful?.(safeEvent)
  //       }

  //       if (e.payload.session.status === 'fulfillment_processing') {
  //         events?.onPaymentProcessing?.(safeEvent)
  //       }

  //       if (e.payload.session.status === 'rejected') {
  //         events?.onPaymentError?.(safeEvent)
  //       }
  //     }
  //   )
  // }

  // private stripeEventToSafeEvent(stripeEvent: OnrampSessionUpdatedEvent): SafeOnRampEvent {
  //   const { session } = stripeEvent.payload
  //   const { quote } = session

  //   if (!quote) throw new Error("Couldn't find quote in the session")

  //   return {
  //     txId: quote.blockchain_tx_id,
  //     walletAddress: session.wallet_address || '',
  //     totalFee: quote.fees?.total_fee,
  //     totalAmount: quote.total_amount,
  //     destination: {
  //       asset: quote.destination_currency?.asset_code,
  //       amount: quote.destination_amount,
  //       network: quote.destination_currency?.currency_network
  //     },
  //     source: {
  //       asset: quote.source_currency?.asset_code,
  //       amount: quote.source_amount,
  //       network: quote.source_currency?.currency_network
  //     }
  //   }
  // }
}
