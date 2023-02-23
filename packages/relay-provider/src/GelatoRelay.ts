import fetch from 'node-fetch'
import { MetaTransactionOptions, RelayProvider, RelayTransaction } from './types'
import {
  GelatoRelay,
  CallWithSyncFeeRequest,
  RelayRequestOptions,
  SponsoredCallRequest,
  RelayResponse
} from '@gelatonetwork/relay-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import {
  GELATO_FEE_COLLECTOR,
  GELATO_NATIVE_TOKEN_ADDRESS,
  GELATO_RELAY_URL,
  ZERO_ADDRESS
} from './constants'

class GelatoNetworkRelay implements RelayProvider {
  #gelatoRelay: GelatoRelay
  #apiKey?: string

  constructor(apiKey?: string) {
    this.#gelatoRelay = new GelatoRelay()
    this.#apiKey = apiKey
  }

  private _getFeeToken(gasToken?: string): string {
    return !gasToken || gasToken === ZERO_ADDRESS ? GELATO_NATIVE_TOKEN_ADDRESS : gasToken
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

  async checkTask(taskId: string) {
    const url = `${GELATO_RELAY_URL}/tasks/status/${taskId}`
    const apiCallResponse = await fetch(url)
    const responseJson = await apiCallResponse.json()
    return responseJson
  }
}

export default GelatoNetworkRelay
