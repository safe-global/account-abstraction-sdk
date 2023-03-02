import EventEmitter from 'events'
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

const eventEmitter = new EventEmitter()
const mockMount = jest.fn()
const mockAddEventListener = jest
  .fn()
  .mockImplementation((event, listener) => eventEmitter.on(event, listener))
const mockDispatch = jest.fn().mockImplementation((event, data) => eventEmitter.emit(event, data))

global.StripeOnramp = jest.fn().mockImplementation(() => {
  return {
    createSession: jest.fn().mockResolvedValue({
      mount: mockMount,
      addEventListener: mockAddEventListener,
      dispatchEvent: mockDispatch
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
    const createSessionSpy = jest
      .spyOn(stripeApi, 'createSession')
      .mockImplementationOnce(() => Promise.resolve(session))

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    const returnedSession = await stripeAdapter.open(openOptions)

    expect(mockMount).toHaveBeenCalledWith(openOptions.element)
    expect(returnedSession).toEqual(session)
    expect(createSessionSpy).toHaveBeenCalledWith('https://onramp-backend-url', {
      walletAddress: '0x',
      networks: ['ethereum']
    })
  })

  it('should throw an exception if the createSession fail', async () => {
    jest.spyOn(utils, 'loadScript').mockImplementation(() => {
      return Promise.resolve()
    })
    jest.spyOn(stripeApi, 'createSession').mockImplementationOnce(() => Promise.reject())

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    await expect(stripeAdapter.open(openOptions)).rejects.toThrow(
      'Error trying to create a new Stripe session'
    )
  })

  it('should try to get the session if a sessionId is provided', async () => {
    jest.spyOn(utils, 'loadScript').mockImplementation(() => {
      return Promise.resolve()
    })
    const getSessionSpy = jest
      .spyOn(stripeApi, 'getSession')
      .mockImplementationOnce(() => Promise.resolve(session))

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    const returnedSession = await stripeAdapter.open({ ...openOptions, sessionId: 'session-id' })

    expect(mockMount).toHaveBeenCalledWith(openOptions.element)
    expect(returnedSession).toEqual(session)
    expect(getSessionSpy).toHaveBeenCalledWith('https://onramp-backend-url', 'session-id')
  })

  it('should respond to events', async () => {
    const mockOnLoaded = jest.fn()
    const mockOnPaymentSuccessful = jest.fn()
    const mockOnPaymentProcessing = jest.fn()
    const mockOnPaymentError = jest.fn()

    jest.spyOn(utils, 'loadScript').mockImplementation(() => {
      return Promise.resolve()
    })
    jest.spyOn(stripeApi, 'createSession').mockImplementationOnce(() => Promise.resolve(session))

    const stripeAdapter = new StripeAdapter(config)

    await stripeAdapter.init()

    await stripeAdapter.open({
      ...openOptions,
      events: {
        onLoaded: mockOnLoaded,
        onPaymentSuccessful: mockOnPaymentSuccessful,
        onPaymentProcessing: mockOnPaymentProcessing,
        onPaymentError: mockOnPaymentError
      }
    })

    expect(mockAddEventListener).toHaveBeenCalledTimes(2)
    mockDispatch('onramp_ui_loaded', 'sessionData')
    expect(mockOnLoaded).toHaveBeenCalled()

    mockDispatch('onramp_session_updated', {
      payload: {
        session: { status: 'fulfillment_complete', quote: { source_monetary_amount: '10' } }
      }
    })
    expect(mockOnPaymentSuccessful).toHaveBeenCalled()

    mockDispatch('onramp_session_updated', {
      payload: {
        session: { status: 'fulfillment_processing', quote: { source_monetary_amount: '10' } }
      }
    })
    expect(mockOnPaymentProcessing).toHaveBeenCalled()

    mockDispatch('onramp_session_updated', {
      payload: { session: { status: 'rejected', quote: { source_monetary_amount: '10' } } }
    })
    expect(mockOnPaymentError).toHaveBeenCalled()
  })
})
