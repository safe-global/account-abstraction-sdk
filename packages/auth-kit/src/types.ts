import { ExternalProvider } from '@ethersproject/providers'
import { WALLET_ADAPTER_TYPE } from '@web3auth/base'
import { ModalConfig } from '@web3auth/modal'

export interface SafeAuthSignInData {
  chainId: string
  eoa: string
  safes?: string[]
}

export interface SafeAuthClient {
  provider: ExternalProvider | null
  init(): Promise<void>
  signIn(): Promise<void>
  signOut(): Promise<void>
}

export enum SafeAuthProviderType {
  Web3Auth
}

export interface Web3AuthProviderConfig {
  rpcTarget: string
  clientId: string
  network: 'mainnet' | 'aqua' | 'celeste' | 'cyan' | 'testnet'
  theme: 'light' | 'dark' | 'auto'
  appLogo?: string
  modalConfig?: Record<WALLET_ADAPTER_TYPE, ModalConfig>
}

export interface SafeAuthConfig {
  chainId: string
  txServiceUrl?: string
  authProviderConfig: Web3AuthProviderConfig
}

export type SafeAuthEventType = 'SIGNED_IN' | 'SIGNED_OUT'

export const SafeAuthEvents: { [key: string]: SafeAuthEventType } = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT'
}
