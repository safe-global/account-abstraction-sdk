type EOA = {
  address: string
  balance: string
}

type UserInfo = {
  name?: string
  email?: string
}

export interface SafeAuthSignInData {
  chainId: string
  eoa: EOA
  safes: string[]
  userInfo: UserInfo
}

export interface SafeAuthClient {
  provider: any
  getUserInfo(): Promise<UserInfo>
  initialize(): Promise<void>
  signIn(): Promise<void>
  signOut(): Promise<void>
}

export enum SafeAuthProviderType {
  Web3Auth
}

export interface SafeAuthConfig {
  chainId: string
  txServiceUrl: string
  infuraKey: string
  web3AuthClientId: string
}
