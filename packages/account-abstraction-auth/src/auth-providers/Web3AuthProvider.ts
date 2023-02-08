import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import type { SafeAuthClient, Web3AuthProviderConfig } from '../types'

export default class Web3AuthProvider implements SafeAuthClient {
  provider: any
  private chainId: string
  private web3authInstance?: Web3Auth
  private config: Web3AuthProviderConfig

  constructor(chainId: string, config: Web3AuthProviderConfig) {
    this.config = config
    this.chainId = chainId
  }

  async initialize() {
    try {
      const web3auth = new Web3Auth({
        clientId: this.config.web3AuthClientId,
        web3AuthNetwork: this.config.web3AuthNetwork,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: this.chainId,
          rpcTarget: this.config.rpcTarget
        },
        uiConfig: {
          theme: this.config.theme,
          loginMethodsOrder: ['facebook', 'google']
        }
      })

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'none'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe',
            defaultLanguage: 'en'
          }
        }
      })

      web3auth.configureAdapter(openloginAdapter)

      await web3auth.initModal()

      this.provider = web3auth.provider
      this.web3authInstance = web3auth
    } catch (error) {
      console.error(error)
    }
  }

  async signIn(): Promise<void> {
    if (!this.web3authInstance) return

    this.provider = await this.web3authInstance.connect()
  }

  async signOut(): Promise<void> {
    if (!this.web3authInstance) return

    return await this.web3authInstance?.logout()
  }

  async getUserInfo(): Promise<{ name?: string; email?: string }> {
    if (!this.web3authInstance) return {}

    const userInfo = await this.web3authInstance?.getUserInfo()

    return { name: userInfo.name, email: userInfo.email }
  }
}
