import Web3AuthAdapter from './Web3AuthAdapter'
import { generateTestingUtils } from 'eth-testing'

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
        configureAdapter: jest.fn()
      }
    })
  }
})

describe('Web3AuthAdapter', () => {
  let adapter: Web3AuthAdapter

  beforeAll(() => {
    adapter = new Web3AuthAdapter('1', {
      clientId: '123',
      network: 'mainnet',
      rpcTarget: 'https://mainnet.infura.io/v3/123',
      theme: 'light'
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    testingUtils.clearAllMocks()
    mockInitModal.mockClear()
    mockConnect.mockClear()
  })

  it('should initialize Web3Auth on init', async () => {
    await adapter.init()
    expect(adapter.provider).not.toBeNull()
    // expect(adapter.provider.constructor.name).toBe('JsonRpcProvider')
  })

  it('should connect to Web3Auth on signIn', async () => {
    await adapter.signIn()
    expect(adapter.provider).not.toBeNull()
    // expect(adapter.provider.constructor.name).toBe('JsonRpcSigner')
  })

  it('should disconnect from Web3Auth on signOut', async () => {
    await adapter.signOut()
    expect(adapter.provider).toBeNull()
  })
})
