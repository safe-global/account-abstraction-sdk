import * as web3AuthModal from '@web3auth/modal'
import EventEmitter from 'events'

import { SafeAuthConfig, SafeAuthProviderType } from './types'
import { SafeAuthKit } from './SafeAuthKit'

const mockInitModal = jest.fn()
const mockConnect = jest.fn().mockResolvedValue({
  sendAsync: jest.fn(),
  send: jest.fn(),
  request: jest.fn()
})

jest.mock('@web3auth/modal', () => {
  return {
    Web3Auth: jest.fn().mockImplementation(() => {
      return {
        provider: {},
        initModal: mockInitModal,
        connect: mockConnect,
        configureAdapter: jest.fn()
      }
    })
  }
})

const config = {
  chainId: '0x1',
  txServiceUrl: 'https://safe-transaction.safe.global',
  authProviderConfig: {
    rpcTarget: 'https://rpc.mainnet.dev',
    clientId: 'web3auth-client-id',
    network: 'testnet',
    theme: 'light'
  }
} as SafeAuthConfig

describe('SafeAuthKit', () => {
  describe('Web3AuthAdapter', () => {
    const MockedWeb3Auth = jest.mocked(web3AuthModal.Web3Auth)

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create a SafeAuthKit instance', async () => {
      const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, config)

      expect(safeAuthKit).toBeInstanceOf(SafeAuthKit)
      expect(safeAuthKit).toBeInstanceOf(EventEmitter)
      expect(safeAuthKit?.safeAuthData).toBeUndefined()
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
  })
})
