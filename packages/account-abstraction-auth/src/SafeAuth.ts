import { ethers } from 'ethers'
import EventEmitter from 'events'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import SafeServiceClient from '@safe-global/safe-service-client'

import Web3AuthProvider from './auth-providers/Web3AuthProvider'
import RPC from './EthereumRPC'
import {
  SafeAuthClient,
  SafeAuthConfig,
  SafeAuthProviderType,
  SafeAuthSignInData,
  SafeAuthEvents
} from './types'

export default class SafeAuth extends EventEmitter {
  safeAuthData?: SafeAuthSignInData
  private authClient?: SafeAuthClient
  private config: SafeAuthConfig

  constructor(providerType: SafeAuthProviderType, config: SafeAuthConfig) {
    super()

    this.config = config
    this.initializeAuthProvider(providerType)
  }

  private async initializeAuthProvider(type: SafeAuthProviderType) {
    switch (type) {
      case SafeAuthProviderType.Web3Auth:
        this.authClient = new Web3AuthProvider(this.config.chainId, this.config.authProviderConfig)

        return await this.authClient.initialize()
      default:
        return
    }
  }

  async signIn(): Promise<SafeAuthSignInData> {
    await this.authClient?.signIn()

    const userInfo = await this.authClient?.getUserInfo()

    const rpc = new RPC(this.getProvider())
    const address = await rpc.getAccounts()
    const balance = await rpc.getBalance()
    const chainId = await rpc.getChainId()

    const { safes } = await this.getSafeCoreClient().getSafesByOwner(address)

    this.emit(SafeAuthEvents.SIGN_IN)

    this.safeAuthData = {
      chainId,
      eoa: { address, balance },
      safes,
      userInfo: userInfo || {}
    }

    return this.safeAuthData
  }

  async signOut(): Promise<void> {
    await this.authClient?.signOut()

    this.safeAuthData = undefined
    this.emit(SafeAuthEvents.SIGN_OUT)
  }

  getProvider() {
    return this.authClient?.provider
  }

  subscribe(eventName: typeof SafeAuthEvents, listener: (...args: any[]) => void) {
    this.on(eventName.toString(), listener)
  }

  private getSafeCoreClient() {
    const provider = new ethers.providers.Web3Provider(this.getProvider())
    const safeOwner = provider.getSigner(0)

    const adapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
    })

    return new SafeServiceClient({
      txServiceUrl: this.config.txServiceUrl,
      ethAdapter: adapter
    })
  }
}
