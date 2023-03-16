import * as web3AuthModal from '@web3auth/modal'
import { generateTestingUtils } from 'eth-testing'
import EventEmitter from 'events'
import { SafeAuthConfig, SafeAuthEvents, SafeAuthProviderType } from './types'
import { SafeAuthKit } from './SafeAuthKit'

const testingUtils = generateTestingUtils({ providerType: 'MetaMask' })

const mockProvider = testingUtils.getProvider()
const mockInitModal = jest.fn()
const mockConnect = jest.fn().mockResolvedValue(mockProvider)

jest.mock('@web3auth/modal', () => {
  return {
    Web3Auth: jest.fn().mockImplementation(() => {
      return {
        provider: mockProvider,
        initModal: mockInitModal,
        connect: mockConnect,
        configureAdapter: jest.fn(),
        logout: jest.fn()
      }
    })
  }
})

jest.mock('@safe-global/safe-service-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getSafesByOwner: jest.fn().mockImplementation(() => {
        return Promise.resolve({ safes: ['0x123', '0x456'] })
      })
    }
  })
})

const config = {
  chainId: '0x1',
  authProviderConfig: {
    rpcTarget: 'https://rpc.mainnet.dev',
    clientId: 'web3auth-client-id',
    network: 'testnet',
    theme: 'light'
  }
} as SafeAuthConfig

describe('SafeAuthKit', () => {
  it('should create a SafeAuthKit instance', async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

    expect(safeAuthKit).toBeInstanceOf(SafeAuthKit)
    expect(safeAuthKit).toBeInstanceOf(EventEmitter)
    expect(safeAuthKit?.safeAuthData).toBeUndefined()
  })

  it('should clean the auth data when signing out', async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

    testingUtils.lowLevel.mockRequest('eth_accounts', [
      '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf'
    ])

    await safeAuthKit?.signIn()
    await safeAuthKit?.signOut()

    expect(safeAuthKit?.safeAuthData).toBeUndefined()
  })

  it('should allow to get the provider', async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

    expect(safeAuthKit?.getProvider()).toBe(mockProvider)
  })

  it('should allow to listen for events (SIGNED_IN / SIGNED_OUT)', async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)
    const signedIn = jest.fn()
    const signedOut = jest.fn()

    safeAuthKit?.subscribe(SafeAuthEvents.SIGNED_IN, signedIn)
    safeAuthKit?.subscribe(SafeAuthEvents.SIGNED_OUT, signedOut)

    testingUtils.lowLevel.mockRequest('eth_accounts', [
      '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf'
    ])

    await safeAuthKit?.signIn()

    expect(signedIn).toHaveBeenCalled()

    await safeAuthKit?.signOut()

    expect(signedOut).toHaveBeenCalled()
  })

  it('should allow to unsubscribe for events (SIGNED_IN / SIGNED_OUT)', async () => {
    const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)
    const signedIn = jest.fn()
    const signedOut = jest.fn()

    safeAuthKit?.subscribe(SafeAuthEvents.SIGNED_IN, signedIn)
    safeAuthKit?.subscribe(SafeAuthEvents.SIGNED_OUT, signedOut)
    safeAuthKit?.unsubscribe(SafeAuthEvents.SIGNED_IN, signedIn)
    safeAuthKit?.unsubscribe(SafeAuthEvents.SIGNED_OUT, signedOut)

    testingUtils.lowLevel.mockRequest('eth_accounts', [
      '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf'
    ])

    await safeAuthKit?.signIn()

    expect(signedIn).toHaveBeenCalledTimes(0)

    await safeAuthKit?.signOut()

    expect(signedOut).toHaveBeenCalledTimes(0)
  })

  describe('using the Web3AuthAdapter', () => {
    const MockedWeb3Auth = jest.mocked(web3AuthModal.Web3Auth)

    beforeEach(() => {
      jest.clearAllMocks()
      testingUtils.clearAllMocks()
      mockInitModal.mockClear()
      mockConnect.mockClear()
    })

    it('should call the initModal method after create a Web3Auth instance', async () => {
      await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

      expect(MockedWeb3Auth).toHaveBeenCalledTimes(1)
      expect(mockInitModal).toHaveBeenCalledTimes(1)
      expect(MockedWeb3Auth).toHaveBeenCalledWith(
        expect.objectContaining({
          chainConfig: {
            chainId: '0x1',
            chainNamespace: 'eip155',
            rpcTarget: 'https://rpc.mainnet.dev'
          },
          clientId: 'web3auth-client-id',
          uiConfig: { loginMethodsOrder: ['google', 'facebook'], theme: 'light' },
          web3AuthNetwork: 'testnet'
        })
      )
    })

    it('should return the associated eoa when the user is signed in', async () => {
      const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

      testingUtils.lowLevel.mockRequest('eth_accounts', [
        '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf'
      ])

      const data = await safeAuthKit?.signIn()

      expect(data).toEqual({
        chainId: '0x1',
        eoa: '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf',
        safes: undefined
      })
    })
  })

  describe('when adding the txServiceUrl to the config', () => {
    it('should return the associated eoa and safes when the user is signed in', async () => {
      const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
        ...config,
        txServiceUrl: 'https://safe-transaction.safe.global'
      })

      testingUtils.lowLevel.mockRequest('eth_accounts', [
        '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf'
      ])

      const data = await safeAuthKit?.signIn()

      expect(data).toEqual({
        chainId: '0x1',
        eoa: '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf',
        safes: ['0x123', '0x456']
      })
    })
  })
})
