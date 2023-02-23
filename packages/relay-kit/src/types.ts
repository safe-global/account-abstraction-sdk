import { RelayResponse } from '@gelatonetwork/relay-sdk'
import { BigNumber } from 'ethers'

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
