import { runTypeChain, glob } from 'typechain'

const safeContractsRoute = '../../node_modules/@gnosis.pm/safe-contracts/build/artifacts/contracts'

async function main() {
  const cwd = process.cwd()
  // find all files matching the glob
  const allFiles = glob(cwd, [
    `${safeContractsRoute}/GnosisSafe.sol/GnosisSafe.json`,
    `${safeContractsRoute}/proxies/GnosisSafeProxy.sol/GnosisSafeProxy.json`
  ])
  const result = await runTypeChain({
    cwd,
    filesToProcess: allFiles,
    allFiles,
    outDir: 'typechain',
    target: 'ethers-v5'
  })
}

main().catch(console.error)
