import { TypedDataSigner } from '@ethersproject/abstract-signer'

export function isTypedDataSigner(signer: any): signer is TypedDataSigner {
  return (signer as unknown as TypedDataSigner)._signTypedData !== undefined
}
