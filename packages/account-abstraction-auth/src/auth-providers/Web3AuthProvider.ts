import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import type { SafeAuthClient } from '../types'

export default class Web3AuthProvider implements SafeAuthClient {
  provider: any
  private clientId: string
  private chain: string
  private web3authInstance?: Web3Auth
  private rpcTarget: string

  constructor(clientId: string, chain: string, rpcTarget: string) {
    this.clientId = clientId
    this.chain = chain
    this.rpcTarget = rpcTarget
  }

  async initialize() {
    try {
      const web3auth = new Web3Auth({
        clientId: this.clientId,
        web3AuthNetwork: 'testnet', // mainnet, aqua, celeste, cyan or testnet
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x1',
          rpcTarget: this.rpcTarget
        },
        uiConfig: {
          theme: 'dark',
          loginMethodsOrder: ['facebook', 'google'],
          appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg' // Your App Logo Here
        }
      })

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'optional' // Pass on the mfa level of your choice: default, optional, mandatory, none
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Your app Name',
            logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
            logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
            defaultLanguage: 'en',
            dark: true // whether to enable dark mode. defaultValue: false
          }
        }
      })

      web3auth.configureAdapter(openloginAdapter)

      await web3auth.initModal({
        modalConfig: {
          [WALLET_ADAPTERS.OPENLOGIN]: {
            label: 'openlogin',
            loginMethods: {
              google: {
                name: 'google login',
                logoDark: 'url to your custom logo which will shown in dark mode'
              },
              facebook: {
                name: 'facebook login',
                // it will hide the facebook option from the Web3Auth modal.
                showOnModal: false
              }
            },
            // setting it to false will hide all social login methods from modal.
            showOnModal: true
          }
        }
      })

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
