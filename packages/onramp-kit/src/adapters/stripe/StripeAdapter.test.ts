import { SafeOnRampOpenOptions, Session } from '../../types'
import { StripeAdapter } from './StripeAdapter'
import * as stripeApi from './stripeApi'

import * as utils from './utils'

const openOptions: SafeOnRampOpenOptions = {
  element: '#root',
  walletAddress: '0x',
  networks: ['ethereum']
}

const config = {
  stripePublicKey: 'pk_test_123',
  onRampBackendUrl: 'https://onramp-backend-url'
}

const session: Session = {
  id: 'cos_1MhDe5KSn9ArdBimmQzf4vzc',
  object: 'crypto.onramp_session',
  client_secret: 'cos_1MhDe5KSn9ArdBimmQzf4vzc_secret_NaOoTfOKoDPCXfGVJz3KX15XO00H6ZNiTOm',
  livemode: false,
  status: 'initialized',
  transaction_details: {
    destination_currency: null,
    destination_network: null,
    lock_wallet_address: true,
    source_currency: null,
    source_exchange_amount: null,
    supported_destination_currencies: ['btc', 'eth', 'sol', 'usdc'],
    supported_destination_networks: ['ethereum', 'polygon'],
    transaction_id: null,
    wallet_address: '0xD725e11588f040d86c4C49d8236E32A5868549F0',
    wallet_addresses: null
  }
}

const mockMount = jest.fn()
const mockEventListener = jest.fn()
global.StripeOnramp = jest.fn().mockImplementation(() => {
  return {
    createSession: jest.fn().mockResolvedValue({
      mount: mockMount,
      addEventListener: mockEventListener
    })
  }
})

describe('StripeAdapter', () => {
  it('should create a StripeAdapter instance', () => {
    const stripeAdapter = new StripeAdapter(config)

    expect(stripeAdapter).toBeInstanceOf(StripeAdapter)
  })

  it('should throw an error if the Stripe JS files are not loaded', async () => {
    const stripeAdapter = new StripeAdapter(config)

    await expect(stripeAdapter.init()).rejects.toThrowError("Couldn't load Stripe's JS files")
  })

  it('should throw an error if the Stripe JS files are not loaded', async () => {
    const stripeAdapter = new StripeAdapter(config)

    await expect(stripeAdapter.init()).rejects.toThrowError("Couldn't load Stripe's JS files")
  })

  it('should call the createSession method in the StripeOnramp instance', async () => {
    const utilsSpy = jest.spyOn(utils, 'loadScript').mockImplementation(() => {
      return Promise.resolve()
    })

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    expect(utilsSpy).toHaveBeenCalledTimes(2)
  })

  it('should try to mount the node specified in the config when open() is called', async () => {
    jest.spyOn(utils, 'loadScript').mockImplementation(() => {
      return Promise.resolve()
    })
    jest.spyOn(stripeApi, 'createSession').mockImplementationOnce(() => Promise.resolve(session))

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    const returnedSession = await stripeAdapter.open(openOptions)

    expect(mockMount).toHaveBeenCalledWith(openOptions.element)
    expect(returnedSession).toEqual(session)
  })
})
