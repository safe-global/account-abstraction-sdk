import { BigNumber } from '@ethersproject/bignumber'
import {
  CallWithSyncFeeRequest,
  GelatoRelay as GelatoNetworkRelay,
  RelayRequestOptions,
  RelayResponse,
  SponsoredCallRequest,
  TransactionStatusResponse
} from '@gelatonetwork/relay-sdk'
import Safe from '@safe-global/safe-core-sdk'
import { MetaTransactionData, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { getEncodedSafeTx } from '../../utils'
import { GELATO_FEE_COLLECTOR, GELATO_NATIVE_TOKEN_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { MetaTransactionOptions, RelayAdapter, RelayTransaction } from '../../types'

export class GelatoRelayAdapter implements RelayAdapter {
  #gelatoRelay: GelatoNetworkRelay
  #apiKey?: string

  constructor(apiKey?: string) {
    this.#gelatoRelay = new GelatoNetworkRelay()
    this.#apiKey = apiKey
  }

  private _getFeeToken(gasToken?: string): string {
    return !gasToken || gasToken === ZERO_ADDRESS ? GELATO_NATIVE_TOKEN_ADDRESS : gasToken
  }

  // TODO: Should be moved to the protocol-kit
  private async _getSafeNonce(safe: Safe): Promise<number> {
    try {
      return await safe.getNonce()
    } catch {
      return 0
    }
  }

  getFeeCollector(): string {
    return GELATO_FEE_COLLECTOR
  }

  async getEstimateFee(
    chainId: number,
    gasLimit: BigNumber,
    gasToken?: string
  ): Promise<BigNumber> {
    const feeToken = this._getFeeToken(gasToken)
    const estimation = await this.#gelatoRelay.getEstimatedFee(chainId, feeToken, gasLimit, true)

    return estimation
  }

  async getTaskStatus(taskId: string): Promise<TransactionStatusResponse | undefined> {
    return this.#gelatoRelay.getTaskStatus(taskId)
  }

  private async _estimateSafeTxGasLimit(safe: Safe, transactions: MetaTransactionData[]) {
    const signerAddress = await safe.getEthAdapter().getSignerAddress()

    if (!signerAddress) {
      throw new Error('EthAdapter needs a signer configured')
    }

    const nonce = await this._getSafeNonce(safe)
    const safeTx = await safe.createTransaction({
      safeTransactionData: transactions,
      options: {
        nonce
      }
    })

    const encodedSafeTx = getEncodedSafeTx(safe, safeTx, signerAddress)
    const estimateGas = await safe.getEthAdapter().estimateGas({
      to: safe.getAddress(),
      from: this.getFeeCollector(),
      data: encodedSafeTx
    })

    console.log(`estimateGas result: ${estimateGas}`)

    return BigNumber.from(estimateGas)
  }

  async createRelayedTransaction(
    safe: Safe,
    transactions: MetaTransactionData[],
    options: MetaTransactionOptions
  ): Promise<SafeTransaction> {
    const { gasLimit, gasToken, isSponsored } = options
    const nonce = await this._getSafeNonce(safe)

    if (isSponsored) {
      const sponsoredTransaction = await safe.createTransaction({
        safeTransactionData: transactions,
        options: {
          nonce
        }
      })

      return sponsoredTransaction
    }

    const chainId = await safe.getChainId()
    const estimationGasLimit = gasLimit ?? (await this._estimateSafeTxGasLimit(safe, transactions))
    const estimatedFee = await this.getEstimateFee(chainId, estimationGasLimit, gasToken)

    const syncTransaction = await safe.createTransaction({
      safeTransactionData: transactions,
      options: {
        baseGas: estimatedFee.toNumber(),
        gasPrice: 1,
        gasToken: gasToken ?? ZERO_ADDRESS,
        refundReceiver: this.getFeeCollector(),
        nonce
      }
    })

    return syncTransaction
  }

  async sponsorTransaction(
    target: string,
    encodedTransaction: string,
    chainId: number
  ): Promise<RelayResponse> {
    if (!this.#apiKey) {
      throw new Error('API key not defined')
    }

    const request: SponsoredCallRequest = {
      chainId,
      target,
      data: encodedTransaction
    }

    const response = await this.#gelatoRelay.sponsoredCall(request, this.#apiKey)

    return response
  }

  async payTransaction(
    target: string,
    encodedTransaction: string,
    chainId: number,
    options: MetaTransactionOptions
  ): Promise<RelayResponse> {
    const { gasLimit, gasToken } = options
    const feeToken = this._getFeeToken(gasToken)
    const request: CallWithSyncFeeRequest = {
      chainId,
      target,
      data: encodedTransaction,
      feeToken,
      isRelayContext: false
    }
    const relayRequestOptions: RelayRequestOptions = {
      gasLimit: gasLimit && gasLimit.toString()
    }
    const response = await this.#gelatoRelay.callWithSyncFee(request, relayRequestOptions)
    return response
  }

  async relayTransaction({
    target,
    encodedTransaction,
    chainId,
    options
  }: RelayTransaction): Promise<RelayResponse> {
    const response = options.isSponsored
      ? this.sponsorTransaction(target, encodedTransaction, chainId)
      : this.payTransaction(target, encodedTransaction, chainId, options)
    return response
  }
}
