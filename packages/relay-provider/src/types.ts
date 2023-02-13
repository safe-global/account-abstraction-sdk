import { RelayResponse } from '@gelatonetwork/relay-sdk'
import { BigNumber } from 'ethers'

// TO-DO: Duplicated. Remove local type and import from "types" package
export interface MetaTransactionOptions {
  isSponsored: boolean
  gasLimit: BigNumber
  gasToken?: string
}

export interface RelayTransaction {
  target: string
  encodedTransaction: string
  chainId: number
  options: MetaTransactionOptions
}

export interface RelayProvider {
  getFeeCollector(): string
  getEstimateFee(chainId: number, gasLimit: BigNumber, gasToken?: string): Promise<BigNumber>
  relayTransaction(transaction: RelayTransaction): Promise<RelayResponse>
}
