import { BigNumber, ethers } from 'ethers'
import { GnosisSafe__factory } from '../typechain/factories'
import { GnosisSafe } from '../typechain/GnosisSafe'
import { MultiSendCallOnly } from '../typechain/libraries'
import { GnosisSafeProxyFactory } from '../typechain/proxies'
import { ZERO_ADDRESS } from './constants'
import {
  AccountAbstractionConfig,
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  RelayProvider,
  RelayTransaction,
  SafeTransactionData
} from './types'
import { getMultiSendCallOnlyContract, getSafeContract, getSafeProxyFactoryContract } from './utils'
import {
  calculateChainSpecificProxyAddress,
  encodeCreateProxyWithNonce,
  encodeExecTransaction,
  encodeMultiSendData,
  getSafeInitializer
} from './utils/contracts'
import { getSignature } from './utils/signatures'

class AccountAbstraction {
  #signer: ethers.Signer
  #chainId?: number
  #safeContract?: GnosisSafe
  #safeProxyFactoryContract?: GnosisSafeProxyFactory
  #multiSendCallOnlyContract?: MultiSendCallOnly
  #relayProvider?: RelayProvider

  constructor(signer: ethers.Signer) {
    this.#signer = signer
  }

  async init(options: AccountAbstractionConfig) {
    if (!this.#signer.provider) {
      throw new Error('Signer must be connected to a provider')
    }
    const { relayProvider } = options
    this.setRelayProvider(relayProvider)

    this.#chainId = (await this.#signer.provider.getNetwork()).chainId
    this.#safeProxyFactoryContract = getSafeProxyFactoryContract(this.#chainId, this.#signer)
    this.#multiSendCallOnlyContract = getMultiSendCallOnlyContract(this.#chainId, this.#signer)
    const safeAddress = await calculateChainSpecificProxyAddress(
      this.#safeProxyFactoryContract,
      this.#signer,
      this.#chainId
    )
    this.#safeContract = GnosisSafe__factory.connect(safeAddress, this.#signer)
  }

  setRelayProvider(relayProvider: RelayProvider) {
    this.#relayProvider = relayProvider
  }

  async getSignerAddress(): Promise<string> {
    const signerAddress = await this.#signer.getAddress()
    return signerAddress
  }

  async getNonce(): Promise<number> {
    if (!this.#safeContract) {
      throw new Error('SDK not initialized')
    }
    return (await this.isSafeDeployed()) ? (await this.#safeContract.nonce()).toNumber() : 0
  }

  getSafeAddress(): string {
    if (!this.#safeContract) {
      throw new Error('SDK not initialized')
    }
    return this.#safeContract.address
  }

  async isSafeDeployed(): Promise<boolean> {
    if (!this.#signer.provider) {
      throw new Error('SDK not initialized')
    }
    const address = this.getSafeAddress()
    const codeAtAddress = await this.#signer.provider.getCode(address)
    const isDeployed = codeAtAddress !== '0x'
    return isDeployed
  }

  private async _standardizeSafeTransactionData(
    transaction: MetaTransactionData,
    options: MetaTransactionOptions
  ): Promise<SafeTransactionData> {
    if (!this.#relayProvider || !this.#chainId) {
      throw new Error('SDK not initialized')
    }
    const { isSponsored, gasLimit, gasToken } = options
    const estimation = await this.#relayProvider.getEstimateFee(this.#chainId, gasLimit, gasToken)

    const standardizedSafeTx: SafeTransactionData = {
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      operation: transaction.operation ?? OperationType.Call,
      safeTxGas: BigNumber.from(0), // Only Safe v1.3.0 supported so far
      baseGas: !isSponsored ? estimation : BigNumber.from(0),
      gasPrice: !isSponsored ? BigNumber.from(1) : BigNumber.from(0),
      gasToken: gasToken ?? ZERO_ADDRESS,
      refundReceiver: !isSponsored ? this.#relayProvider.getFeeCollector() : ZERO_ADDRESS,
      nonce: await this.getNonce()
    }
    return standardizedSafeTx
  }

  async relayTransaction(
    transaction: MetaTransactionData,
    options: MetaTransactionOptions
  ): Promise<string> {
    if (
      !this.#relayProvider ||
      !this.#chainId ||
      !this.#safeContract ||
      !this.#multiSendCallOnlyContract ||
      !this.#safeProxyFactoryContract
    ) {
      throw new Error('SDK not initialized')
    }

    let standardizedSafeTx = await this._standardizeSafeTransactionData(transaction, options)
    let signature = await getSignature(
      this.#signer,
      this.getSafeAddress(),
      standardizedSafeTx,
      this.#chainId
    )
    let transactionData = await encodeExecTransaction(
      this.#safeContract,
      standardizedSafeTx,
      signature
    )

    let relayTransactionTarget = ''
    let encodedTransaction = ''
    const isSafeDeployed = await this.isSafeDeployed()
    if (isSafeDeployed) {
      relayTransactionTarget = this.#safeContract.address
      encodedTransaction = transactionData
    } else {
      relayTransactionTarget = this.#multiSendCallOnlyContract.address
      const safeSingletonContract = getSafeContract(this.#chainId, this.#signer)
      const initializer = await getSafeInitializer(
        this.#safeContract,
        await this.getSignerAddress(),
        this.#chainId
      )

      const safeDeploymentTransaction: MetaTransactionData = {
        to: this.#safeProxyFactoryContract.address,
        value: BigNumber.from(0),
        data: encodeCreateProxyWithNonce(
          this.#safeProxyFactoryContract,
          safeSingletonContract.address,
          initializer
        ),
        operation: OperationType.Call
      }
      const safeTransaction: MetaTransactionData = {
        to: this.#safeContract.address,
        value: BigNumber.from(0),
        data: transactionData,
        operation: OperationType.Call
      }

      const multiSendData = encodeMultiSendData([safeDeploymentTransaction, safeTransaction])
      encodedTransaction = this.#multiSendCallOnlyContract.interface.encodeFunctionData(
        'multiSend',
        [multiSendData]
      )
    }

    const relayTransaction: RelayTransaction = {
      target: relayTransactionTarget,
      encodedTransaction: encodedTransaction,
      chainId: this.#chainId,
      options
    }
    const response = await this.#relayProvider.relayTransaction(relayTransaction)
    return response.taskId
  }
}

export default AccountAbstraction
