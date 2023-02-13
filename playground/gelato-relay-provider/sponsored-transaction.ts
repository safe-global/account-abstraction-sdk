import AccountAbstraction, { MetaTransactionData, MetaTransactionOptions, OperationType } from '@safe-global/account-abstraction'
import GelatoNetworkRelay from '@safe-global/relay-provider'
import { ethers, BigNumber } from 'ethers'

// Fund the 1Balance account that will sponsor the transaction and get the API key:
// https://relay.gelato.network/

// Check the status of a transaction after it is relayed:
// https://relay.gelato.digital/tasks/status/<TASK_ID>

// Check the status of a transaction after it is executed:
// https://goerli.etherscan.io/tx/<TRANSACTION_HASH>

const config = {
  SAFE_ADDRESS: '<SAFE_ADDRESS>',
  SAFE_SIGNER_PRIVATE_KEY: '<SAFE_SIGNER_PRIVATE_KEY>',
  CHAIN_ID: 5,
  RPC_URL: 'https://goerli.infura.io/v3/<INFURA_API_KEY>',
  GELATO_RELAY_API_KEY: '<GELATO_RELAY_API_KEY>',
}

const txConfig = {
  TO: '<TO>',
  DATA: '<DATA>',
  VALUE: BigNumber.from('<VALUE>'),
  // Options:
  GAS_LIMIT: BigNumber.from('<GAS_LIMIT>')
}

async function main() {
  console.log('Execute meta-transaction via Gelato Relay payed by 1Balance')

  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL)
  const signer = new ethers.Wallet(config.SAFE_SIGNER_PRIVATE_KEY, provider)
  
  const relayProvider = new GelatoNetworkRelay(config.GELATO_RELAY_API_KEY)

  const safeAccountAbstraction = new AccountAbstraction(signer, config.SAFE_ADDRESS, config.CHAIN_ID)
  safeAccountAbstraction.setRelayProvider(relayProvider)

  const safeTransaction: MetaTransactionData = {
    to: txConfig.TO,
    data: txConfig.DATA,
    value: txConfig.VALUE,
    operation: OperationType.Call
  }
  const options: MetaTransactionOptions = {
    isSponsored: true,
    gasLimit: txConfig.GAS_LIMIT
  }

  const response = await safeAccountAbstraction.relayTransaction(safeTransaction, options)
  console.log({ 'Gelato taskId': response })
}

main()
