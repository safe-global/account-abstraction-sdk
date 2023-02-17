import { ExternalProvider } from '@ethersproject/providers'

type UserInfo = {
  name?: string
  email?: string
}

export interface SafeAuthSignInData {
  chainId: string
  eoa: string
  safes?: string[]
}

export interface SafeAuthClient {
  provider: ExternalProvider | null
  getUserInfo(): Promise<UserInfo>
  init(): Promise<void>
  signIn(): Promise<void>
  signOut(): Promise<void>
}

export enum SafeAuthProviderType {
  Web3Auth
}

export interface Web3AuthProviderConfig {
  rpcTarget: string
  web3AuthClientId: string
  web3AuthNetwork: 'mainnet' | 'aqua' | 'celeste' | 'cyan' | 'testnet'
  theme: 'light' | 'dark' | 'auto'
  appLogo?: string
}

export interface SafeAuthConfig {
  chainId: string
  txServiceUrl?: string
  authProviderConfig: Web3AuthProviderConfig
}

export const SafeAuthEvents = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT'
}
