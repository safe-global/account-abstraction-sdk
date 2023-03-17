import type Safe from '@safe-global/safe-core-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

export const getEncodedSafeTx = (safeSDK: Safe, safeTx: SafeTransaction, from: string): string => {
  const EXEC_TX_METHOD = 'execTransaction'

  return safeSDK
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
      generatePreValidatedSignature(from)
    ])
}

export function generatePreValidatedSignature(ownerAddress: string): string {
  const signature =
    '0x000000000000000000000000' +
    ownerAddress.slice(2) +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '01'

  return signature
}
