import { ethers } from 'ethers'
import EventEmitter from 'events'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import SafeServiceClient from '@safe-global/safe-service-client'
import Web3AuthProvider from './providers/Web3AuthProvider'

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

    const ethersProvider = new ethers.providers.Web3Provider(this.authClient?.provider)
    const signer = ethersProvider.getSigner()
    const address = await signer.getAddress()

    let safes: string[] | undefined

    // Retrieve safes if txServiceUrl is provided
    if (this.config.txServiceUrl) {
      try {
        const safesByOwner = await this.getSafeCoreClient().getSafesByOwner(address)
        safes = safesByOwner.safes
      } catch (e) {
        console.error('There was an error while trying to get the safes for the current user')
      }
    }

    this.emit(SafeAuthEvents.SIGNED_IN)

    this.safeAuthData = {
      chainId: this.config.chainId,
      eoa: address,
      safes
    }

    return this.safeAuthData
  }

  async signOut(): Promise<void> {
    await this.authClient?.signOut()

    this.safeAuthData = undefined
    this.emit(SafeAuthEvents.SIGNED_OUT)
  }

  getProvider() {
    return this.authClient?.provider
  }

  subscribe(eventName: typeof SafeAuthEvents, listener: (...args: any[]) => void) {
    this.on(eventName.toString(), listener)
  }

  private getSafeCoreClient(): SafeServiceClient {
    if (!this.config.txServiceUrl) {
      throw new Error('txServiceUrl is not defined')
    }

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
