import { RelayProvider, RelayTransaction } from '@safe-global/relay-provider'
import ethers, { BigNumber } from 'ethers'
import { EIP712_SAFE_TX_TYPES, ZERO_ADDRESS } from './constants'
import { GnosisSafe__factory } from '../typechain/factories/GnosisSafe__factory'
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  SafeTransactionData,
  SafeTxTypedData
} from './types'
import { isTypedDataSigner } from './utils'
import { GnosisSafe } from '../typechain/GnosisSafe'

class AccountAbstraction {
  #safeAddress: string
  #safeContract: GnosisSafe
  #chainId: number
  #signer: ethers.Signer
  #relayProvider?: RelayProvider

  constructor(signer: ethers.Signer, safeAddress: string, chainId: number) {
    this.#safeAddress = safeAddress
    this.#signer = signer
    this.#chainId = chainId
    this.#safeContract = GnosisSafe__factory.connect(safeAddress, signer)
  }

  setRelayProvider(relayProvider: RelayProvider) {
    this.#relayProvider = relayProvider
  }

  private async _getExecTransactionData(transaction: SafeTransactionData) {
    const signature = await this._getSignature(transaction)
    return (this.#safeContract as any).interface.encodeFunctionData('execTransaction', [
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation,
      transaction.safeTxGas,
      transaction.baseGas,
      transaction.gasPrice,
      transaction.gasToken,
      transaction.refundReceiver,
      signature
    ])
  }

  private async _getSignature(transaction: SafeTransactionData) {
    const typedData = this._getSignTypedData(transaction)
    let signature
    if (isTypedDataSigner(this.#signer)) {
      signature = await this.#signer._signTypedData(
        typedData.domain,
        { SafeTx: typedData.types.SafeTx },
        typedData.message
      )
    }
    return signature
  }

  private _getSignTypedData = (transaction: SafeTransactionData): SafeTxTypedData => {
    return {
      types: EIP712_SAFE_TX_TYPES,
      domain: {
        chainId: this.#chainId,
        verifyingContract: this.#safeAddress
      },
      primaryType: 'SafeTx',
      message: {
        to: transaction.to,
        value: transaction.value.toString(),
        data: transaction.data,
        operation: transaction.operation,
        safeTxGas: transaction.safeTxGas.toString(),
        baseGas: transaction.baseGas.toString(),
        gasPrice: transaction.gasPrice.toString(),
        gasToken: transaction.gasToken,
        refundReceiver: transaction.refundReceiver,
        nonce: transaction.nonce.toString()
      }
    }
  }

  private async _standardizeSafeTransactionData(
    transaction: MetaTransactionData,
    options: MetaTransactionOptions
  ): Promise<SafeTransactionData> {
    if (!this.#relayProvider) {
      throw new Error('Relay Provider is not set')
    }
    const estimation = await this.#relayProvider.getEstimateFee(
      this.#chainId,
      options.gasLimit,
      options.gasToken
    )
    const standardizedSafeTx: SafeTransactionData = {
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      operation: transaction.operation ?? OperationType.Call,
      safeTxGas: BigNumber.from(0), // Only Safe V1.3 supported so far
      baseGas: estimation ?? BigNumber.from(0),
      gasPrice: !options.isSponsored ? BigNumber.from(1) : BigNumber.from(0),
      gasToken: options.gasToken ?? ZERO_ADDRESS,
      refundReceiver: !options.isSponsored ? this.#relayProvider.getFeeCollector() : ZERO_ADDRESS,
      nonce: await this.#safeContract.nonce()
    }
    return standardizedSafeTx
  }

  async relayTransaction(
    transaction: MetaTransactionData,
    options: MetaTransactionOptions
  ): Promise<string> {
    if (!this.#relayProvider) {
      throw new Error('Relay Provider is not set')
    }
    const standardizedSafeTx = await this._standardizeSafeTransactionData(transaction, options)
    const encodedTransaction = await this._getExecTransactionData(standardizedSafeTx)
    const relayTransaction: RelayTransaction = {
      target: this.#safeAddress,
      encodedTransaction: encodedTransaction,
      chainId: this.#chainId,
      options
    }
    const response = await this.#relayProvider.relayTransaction(relayTransaction)
    return response.taskId
  }
}

export default AccountAbstraction
