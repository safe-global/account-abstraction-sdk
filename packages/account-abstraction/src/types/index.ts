import { BigNumber } from '@ethersproject/bignumber'

export enum OperationType {
  Call,
  DelegateCall
}

export interface AccountAbstractionConfig {
  relayAdapter: RelayAdapter
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
  nonce: number
}

// TO-DO: Duplicated. Remove local type and import from "types" package
// {

export interface MetaTransactionOptions {
  gasLimit: BigNumber
  gasToken?: string
  isSponsored?: boolean
}

export interface RelayTransaction {
  target: string
  encodedTransaction: string
  chainId: number
  options: MetaTransactionOptions
}

// import { RelayResponse } from '@gelatonetwork/relay-sdk'
export interface RelayResponse {
  taskId: string
}

export interface RelayAdapter {
  getFeeCollector(): string
  getEstimateFee(chainId: number, gasLimit: BigNumber, gasToken?: string): Promise<BigNumber>
  relayTransaction(transaction: RelayTransaction): Promise<RelayResponse>
}

// }
// TO-DO: Duplicated. Remove local type and import from "types" package

export interface SafeSetupConfig {
  owners: string[]
  threshold: number
  fallbackHandlerAddress: string
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
