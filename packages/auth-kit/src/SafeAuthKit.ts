import { ethers } from 'ethers'
import EventEmitter from 'events'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import SafeServiceClient from '@safe-global/safe-service-client'
import Web3AuthAdapter from './adapters/Web3AuthAdapter'

import {
  SafeAuthClient,
  SafeAuthConfig,
  SafeAuthProviderType,
  SafeAuthSignInData,
  SafeAuthEvents
} from './types'

/**
 * SafeAuthKit provides a simple interface for web2 logins
 */
export default class SafeAuthKit extends EventEmitter {
  safeAuthData?: SafeAuthSignInData
  #client: SafeAuthClient
  #config: SafeAuthConfig

  /**
   * Initialize the SafeAuthKit
   * @constructor
   * @param client The client implementing the SafeAuthClient interface
   * @param config The configuration options
   */
  constructor(client: SafeAuthClient, config: SafeAuthConfig) {
    super()

    this.#client = client
    this.#config = config
  }

  /**
   * The static method allows to initialize the SafeAuthKit asynchronously
   * @param providerType Choose the provider service to use
   * @param config The configuration including the one for the specific provider
   * @returns A SafeAuthKit instance
   * @throws Error if the provider type is not supported
   */
  static async init(
    providerType: SafeAuthProviderType,
    config: SafeAuthConfig
  ): Promise<SafeAuthKit | undefined> {
    let client

    switch (providerType) {
      case SafeAuthProviderType.Web3Auth:
        client = new Web3AuthAdapter(config.chainId, config.authProviderConfig)
        break
      default:
        throw new Error('Provider type not supported')
    }

    await client.init()

    return new SafeAuthKit(client, config)
  }

  /**
   * Authenticate the user
   * @returns the derived external owned account and the safes associated with the user if the txServiceUrl is provided
   * @throws Error if the provider was not created
   * @throws Error if there was an error while trying to get the safes for the current user using the provided txServiceUrl
   */
  async signIn(): Promise<SafeAuthSignInData> {
    await this.#client.signIn()

    if (!this.#client.provider) {
      throw new Error('Provider is not defined')
    }

    const ethersProvider = new ethers.providers.Web3Provider(this.#client.provider)
    const signer = ethersProvider.getSigner()
    const address = await signer.getAddress()

    let safes: string[] | undefined

    // Retrieve safes if txServiceUrl is provided
    if (this.#config.txServiceUrl) {
      try {
        const safesByOwner = await this.#getSafeCoreClient().getSafesByOwner(address)
        safes = safesByOwner.safes
      } catch (e) {
        throw new Error('There was an error while trying to get the safes for the current user')
      }
    }

    this.emit(SafeAuthEvents.SIGNED_IN)

    this.safeAuthData = {
      chainId: this.#config.chainId,
      eoa: address,
      safes
    }

    return this.safeAuthData
  }

  /**
   * Sign out the user
   */
  async signOut(): Promise<void> {
    await this.#client?.signOut()

    this.safeAuthData = undefined
    this.emit(SafeAuthEvents.SIGNED_OUT)
  }

  /**
   *
   * @returns The Ethereum provider
   */
  getProvider() {
    if (!this.#client) return null

    return this.#client?.provider
  }

  /**
   * Subscribe to an event
   * @param eventName The event name to subscribe to. Choose from SafeAuthEvents type
   * @param listener The callback function to be called when the event is emitted
   */
  subscribe(eventName: typeof SafeAuthEvents, listener: (...args: any[]) => void) {
    this.on(eventName.toString(), listener)
  }

  /**
   * Unsubscribe from an event
   * @param eventName The event name to unsubscribe from. Choose from SafeAuthEvents type
   * @param listener The callback function to unsubscribe
   */
  unsubscribe(eventName: typeof SafeAuthEvents, listener: (...args: any[]) => void) {
    this.off(eventName.toString(), listener)
  }

  /**
   * Get the SafeServiceClient instance
   * @returns A SafeServiceClient instance
   */
  #getSafeCoreClient(): SafeServiceClient {
    if (!this.#client?.provider) {
      throw new Error('Provider is not defined')
    }

    if (!this.#config.txServiceUrl) {
      throw new Error('txServiceUrl is not defined')
    }

    const provider = new ethers.providers.Web3Provider(this.#client?.provider)
    const safeOwner = provider.getSigner(0)

    const adapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner
    })

    return new SafeServiceClient({
      txServiceUrl: this.#config.txServiceUrl,
      ethAdapter: adapter
    })
  }
}
