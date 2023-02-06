import { CHAIN_NAMESPACES, CustomChainConfig } from '@web3auth/base'

export const getChainConfig = (
  infuraKey: string
): Record<string, Partial<CustomChainConfig> & Pick<CustomChainConfig, 'chainNamespace'>> => ({
  '1': {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x1',
    rpcTarget: `https://mainnet.infura.io/v3/${infuraKey}`
  },
  '5': {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x5',
    rpcTarget: `https://goerli.infura.io/v3/${infuraKey}`
  }
})
