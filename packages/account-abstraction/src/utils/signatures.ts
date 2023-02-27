import { TypedDataSigner } from '@ethersproject/abstract-signer'
import { Signer } from 'ethers'
import { EIP712_SAFE_TX_TYPES } from '../constants'
import { SafeTransactionData, SafeTxTypedData } from '../types'

export function isTypedDataSigner(signer: any): signer is TypedDataSigner {
  return (signer as unknown as TypedDataSigner)._signTypedData !== undefined
}

export function getSignTypedData(
  safeAddress: string,
  transaction: SafeTransactionData,
  chainId: number
): SafeTxTypedData {
  return {
    types: EIP712_SAFE_TX_TYPES,
    domain: {
      chainId,
      verifyingContract: safeAddress
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

export async function getSignature(
  signer: Signer,
  safeAddress: string,
  transaction: SafeTransactionData,
  chainId: number
): Promise<string> {
  const typedData = getSignTypedData(safeAddress, transaction, chainId)
  let signature = ''
  if (isTypedDataSigner(signer)) {
    signature = await signer._signTypedData(
      typedData.domain,
      { SafeTx: typedData.types.SafeTx },
      typedData.message
    )
  }
  return signature
}
