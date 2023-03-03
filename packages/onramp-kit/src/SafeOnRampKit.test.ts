import { SafeOnRampConfig, SafeOnRampOpenOptions, SafeOnRampProviderType } from './types'

import { SafeOnRampKit } from './SafeOnRampKit'
import * as stripeAdapter from './adapters/stripe/StripeAdapter'

const openOptions: SafeOnRampOpenOptions = {
  element: '#root',
  walletAddress: '0x',
  networks: ['ethereum']
}

const config = {
  onRampProviderConfig: {
    stripePublicKey: 'stripe-public-key',
    onRampBackendUrl: 'onramp-backend-url'
  }
} as SafeOnRampConfig

jest.mock('./adapters/stripe/StripeAdapter')

describe('SafeOnRampKit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should create a SafeOnRampKit instance when using the init() method', async () => {
    const safeOnRampKit = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, config)

    expect(safeOnRampKit).toBeInstanceOf(SafeOnRampKit)
  })

  it('should create a XXXAdapter instance using the provider config and call the init() method in the instance', async () => {
    await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, config)

    expect(stripeAdapter.StripeAdapter).toHaveBeenCalledWith(
      expect.objectContaining(config.onRampProviderConfig)
    )
    expect(stripeAdapter.StripeAdapter.prototype.init).toHaveBeenCalledWith()
  })

  it('should call the open method in the XXXAdapter with the corresponding options', async () => {
    const safeOnRampKit = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, config)

    safeOnRampKit.open(openOptions)

    expect(stripeAdapter.StripeAdapter.prototype.open).toHaveBeenCalledWith(
      expect.objectContaining(openOptions)
    )
  })

  it('should call the close method in the XXXAdapter', async () => {
    const safeOnRampKit = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, config)

    safeOnRampKit.close()

    expect(stripeAdapter.StripeAdapter.prototype.close).toHaveBeenCalled()
  })

  it('should throw an error if the provider type is not supported', async () => {
    //@ts-expect-error - Testing unsupported provider type
    await expect(SafeOnRampKit.init('unsupported' as SafeAuthProviderType, config)).rejects.toThrow(
      'Provider type not supported'
    )
  })
})
