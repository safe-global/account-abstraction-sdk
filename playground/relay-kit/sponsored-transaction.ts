import AccountAbstraction, {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType
} from '@safe-global/account-abstraction-kit-poc'
import { GelatoRelayAdapter } from '@safe-global/relay-kit'
import { BigNumber, ethers } from 'ethers'
import { AccountAbstractionConfig } from './../../packages/account-abstraction-kit/src/types/index'

// Fund the 1Balance account that will sponsor the transaction and get the API key:
// https://relay.gelato.network/

// Check the status of a transaction after it is relayed:
// https://relay.gelato.digital/tasks/status/<TASK_ID>

// Check the status of a transaction after it is executed:
// https://goerli.etherscan.io/tx/<TRANSACTION_HASH>

const config = {
  SAFE_SIGNER_PRIVATE_KEY: '<SAFE_SIGNER_PRIVATE_KEY>',
  RPC_URL: 'https://goerli.infura.io/v3/<INFURA_API_KEY>',
  RELAY_API_KEY: '<GELATO_RELAY_API_KEY>'
}

const mockOnRampConfig = {
  ADDRESS: '0x4D39a545144D8e2F19E8009aB5F123FA1043cc98',
  PRIVATE_KEY: '0x32ecaa3b2feb4051470c98b6d2f2da8861ae83b11ccc7123aee1c9efc4ef1933'
}

const txConfig = {
  TO: '<TO>',
  DATA: '<DATA>',
  VALUE: BigNumber.from('<VALUE>'),
  // Options:
  GAS_LIMIT: BigNumber.from('<GAS_LIMIT>')
}

async function main() {
  console.log('Execute meta-transaction via Gelato Relay paid by 1Balance')

  // SDK Initialization

  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL)
  const signer = new ethers.Wallet(config.SAFE_SIGNER_PRIVATE_KEY, provider)

  const relayAdapter = new GelatoRelayAdapter(config.RELAY_API_KEY)

  const safeAccountAbstraction = new AccountAbstraction(signer)
  const sdkConfig: AccountAbstractionConfig = {
    relayAdapter
  }
  await safeAccountAbstraction.init(sdkConfig)

  // Calculate Safe address

  const predictedSafeAddress = safeAccountAbstraction.getSafeAddress()
  console.log({ predictedSafeAddress })

  const isSafeDeployed = await safeAccountAbstraction.isSafeDeployed()
  console.log({ isSafeDeployed })

  // Fake on-ramp to fund the Safe

  const safeBalance = await provider.getBalance(predictedSafeAddress)
  console.log({ safeBalance: ethers.utils.formatEther(safeBalance.toString()) })
  if (safeBalance.lt(txConfig.VALUE)) {
    const fakeOnRampSigner = new ethers.Wallet(mockOnRampConfig.PRIVATE_KEY, provider)
    const onRampResponse = await fakeOnRampSigner.sendTransaction({
      to: predictedSafeAddress,
      value: txConfig.VALUE
    })
    console.log(
      `Funding the Safe with ${ethers.utils.formatEther(txConfig.VALUE.toString())} ETH`
    )
    await onRampResponse.wait()

    const safeBalanceAfter = await provider.getBalance(predictedSafeAddress)
    console.log({ safeBalance: ethers.utils.formatEther(safeBalanceAfter.toString()) })
  }

  // Relay the transaction

  const safeTransaction: MetaTransactionData = {
    to: txConfig.TO,
    data: txConfig.DATA,
    value: txConfig.VALUE,
    operation: OperationType.Call
  }
  const options: MetaTransactionOptions = {
    gasLimit: txConfig.GAS_LIMIT,
    isSponsored: true
  }

  const response = await safeAccountAbstraction.relayTransaction(safeTransaction, options)
  console.log({ GelatoTaskId: response })
}

main()
