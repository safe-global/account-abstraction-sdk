import Web3AuthProvider from './auth-providers/Web3AuthProvider'
import RPC from './EthereumRPC'
import { ethers } from 'ethers'
import EventEmitter from 'events'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import SafeServiceClient from '@safe-global/safe-service-client'
import {
  SafeAuthClient,
  SafeAuthConfig,
  SafeAuthProviderType,
  SafeAuthSignInResponse
} from './types'

export default class SafeAuth extends EventEmitter {
  private authClient?: SafeAuthClient
  private txServiceUrl: string
  private infuraKey: string
  private web3AuthClientId: string

  constructor(
    providerType: SafeAuthProviderType,
    { chainId, txServiceUrl, infuraKey, web3AuthClientId }: SafeAuthConfig
  ) {
    super()

    this.txServiceUrl = txServiceUrl
    this.infuraKey = infuraKey
    this.web3AuthClientId = web3AuthClientId
    this.initializeAuthProvider(providerType, chainId)
  }

  private async initializeAuthProvider(type: SafeAuthProviderType, chainId: string) {
    switch (type) {
      case SafeAuthProviderType.Web3Auth:
        this.authClient = new Web3AuthProvider(this.web3AuthClientId || '', chainId, this.infuraKey)

        return await this.authClient.initialize()
      default:
        return
    }
  }

  async signIn(): Promise<SafeAuthSignInResponse> {
    await this.authClient?.signIn()

    const userInfo = await this.authClient?.getUserInfo()

    const rpc = new RPC(this.getProvider())
    const address = await rpc.getAccounts()
    const balance = await rpc.getBalance()
    const chainId = await rpc.getChainId()

    const { safes } = await this.getSafeCoreClient().getSafesByOwner(address)

    this.emit('signIn')

    return {
      chainId,
      eoa: { address, balance },
      safes,
      userInfo: userInfo || {}
    }
  }

  async signOut(): Promise<void> {
    await this.authClient?.signOut()

    this.emit('signOut')
  }

  getProvider() {
    return this.authClient?.provider
  }

  subscribe(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.on(eventName, listener)
  }

  private getSafeCoreClient() {
    const provider = new ethers.providers.Web3Provider(this.getProvider())
    const safeOwner = provider.getSigner(0)

    const adapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
    })

    return new SafeServiceClient({
      txServiceUrl: this.txServiceUrl,
      ethAdapter: adapter
    })
  }
}
