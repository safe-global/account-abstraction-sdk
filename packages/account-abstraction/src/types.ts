import { BigNumber } from '@ethersproject/bignumber'

export enum OperationType {
  Call,
  DelegateCall
}

export interface MetaTransactionData {
  to: string
  value: BigNumber
  data: string
  operation?: OperationType
}

export interface SafeTransactionData extends MetaTransactionData {
  operation: OperationType
  safeTxGas: BigNumber
  baseGas: BigNumber
  gasPrice: BigNumber
  gasToken: string
  refundReceiver: string
  nonce: BigNumber
}

export interface MetaTransactionOptions {
  isSponsored: boolean
  gasLimit: BigNumber
  gasToken?: string
}

interface Eip712MessageTypes {
  EIP712Domain: {
    type: string
    name: string
  }[]
  SafeTx: {
    type: string
    name: string
  }[]
}

export interface SafeTxTypedData {
  types: Eip712MessageTypes
  domain: {
    chainId?: number
    verifyingContract: string
  }
  primaryType: 'SafeTx'
  message: {
    to: string
    value: string
    data: string
    operation: OperationType
    safeTxGas: string
    baseGas: string
    gasPrice: string
    gasToken: string
    refundReceiver: string
    nonce: string
  }
}
