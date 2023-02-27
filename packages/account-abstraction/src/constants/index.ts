export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// keccak256(toUtf8Bytes('Safe Account Abstraction'))
export const PREDETERMINED_SALT_NONCE =
  '0xb1073742015cbcf5a3a4d9d1ae33ecf619439710b89475f92e2abd2117e90f90'

export const SIGNED_TYPE_DATA_METHOD = 'eth_signTypedData_v4'

export const EIP712_SAFE_TX_TYPES = {
  EIP712Domain: [
    {
      type: 'uint256',
      name: 'chainId'
    },
    {
      type: 'address',
      name: 'verifyingContract'
    }
  ],
  SafeTx: [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'data' },
    { type: 'uint8', name: 'operation' },
    { type: 'uint256', name: 'safeTxGas' },
    { type: 'uint256', name: 'baseGas' },
    { type: 'uint256', name: 'gasPrice' },
    { type: 'address', name: 'gasToken' },
    { type: 'address', name: 'refundReceiver' },
    { type: 'uint256', name: 'nonce' }
  ]
}
