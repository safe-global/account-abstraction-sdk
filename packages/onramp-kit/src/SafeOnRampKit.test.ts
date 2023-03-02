import { generateTestingUtils } from 'eth-testing'
import { SafeOnRampConfig, SafeOnRampProviderType } from './types'

import { SafeOnRampKit } from './SafeOnRampKit'

const testingUtils = generateTestingUtils({ providerType: 'MetaMask' })

const config = {
  onRampProviderConfig: {
    stripePublicKey: 'stripe-public-key',
    onRampBackendUrl: 'onramp-backend-url'
  }
} as SafeOnRampConfig

jest.mock('./adapters/stripe/utils', () => {
  return {
    loadScript: jest.fn().mockResolvedValue(true)
  }
})

global.StripeOnramp = jest.fn().mockImplementation(() => {
  return {
    createSession: jest.fn().mockResolvedValue({
      mount: jest.fn(),
      addEventListener: jest.fn()
    })
  }
})

describe('SafeOnRampKit', () => {
  it('should create a SafeOnRampKit instance', async () => {
    const safeOnRampKit = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, config)

    expect(safeOnRampKit).toBeInstanceOf(SafeOnRampKit)
  })

  it('should throw an error if the provider type is not supported', async () => {
    //@ts-expect-error
    await expect(SafeOnRampKit.init('unsupported' as SafeAuthProviderType, config)).rejects.toThrow(
      'Provider type not supported'
    )
  })

  describe('using the StripeAdapter', () => {
    // beforeEach(() => {
    //   jest.clearAllMocks()
    //   testingUtils.clearAllMocks()
    // })
  })
})
