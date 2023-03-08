import { RelayResponse, TransactionStatusResponse } from '@gelatonetwork/relay-sdk'
import { BigNumber } from 'ethers'
import Safe from '@safe-global/safe-core-sdk'
import { MetaTransactionData, SafeTransactionData } from '@safe-global/safe-core-sdk-types'

// TO-DO: Duplicated. Remove local type and import from "types" package
// {

export interface MetaTransactionOptions {
  gasLimit: BigNumber
  gasToken?: string
  isSponsored?: boolean
}

export interface RelayAdapter {
  getFeeCollector(): string
  getEstimateFee(chainId: number, gasLimit: BigNumber, gasToken?: string): Promise<BigNumber>
  getTaskStatus(taskId: string): Promise<TransactionStatusResponse | undefined>
  createRelayedTransaction(
    transaction: MetaTransactionData,
    safe: Safe,
    options: MetaTransactionOptions
  ): Promise<SafeTransactionData>
  relayTransaction(transaction: RelayTransaction): Promise<RelayResponse>
}

export interface RelayTransaction {
  target: string
  encodedTransaction: string
  chainId: number
  options: MetaTransactionOptions
}

// }
// TO-DO: Duplicated. Remove local type and import from "types" package
