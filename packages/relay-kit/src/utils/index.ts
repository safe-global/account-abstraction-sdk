import type Safe from '@safe-global/safe-core-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generatePreValidatedSignature } from '@safe-global/safe-core-sdk/dist/src/utils/signatures'

export const getEncodedSafeTx = (safeSDK: Safe, safeTx: SafeTransaction, from: string): string => {
  const EXEC_TX_METHOD = 'execTransaction'

  const owner = from.toLowerCase()
  const needsOwnerSig = !safeTx.signatures.has(owner)
  if (needsOwnerSig) {
    const ownerSig = generatePreValidatedSignature(owner)
    safeTx.addSignature(ownerSig)
  }

  const encodedTx = safeSDK
    .getContractManager()
    .safeContract.encode(EXEC_TX_METHOD, [
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
      safeTx.data.safeTxGas,
      safeTx.data.baseGas,
      safeTx.data.gasPrice,
      safeTx.data.gasToken,
      safeTx.data.refundReceiver,
      safeTx.encodedSignatures()
    ])

  if (needsOwnerSig) {
    safeTx.signatures.delete(owner)
  }

  return encodedTx
}
