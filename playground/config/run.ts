import { execSync } from 'child_process'

const playInput = process.argv[2]

const playgroundPaths = {
  'paid-transaction': 'gelato-relay-provider/paid-transaction',
  'sponsored-transaction': 'gelato-relay-provider/sponsored-transaction'
}

const path = playgroundPaths[playInput]
if (!path) {
  console.log('Execute one of the existing playgrounds:')
  const playgrounds = Object.keys(playgroundPaths)
  playgrounds.forEach((playground) => {
    console.log(` > yarn play ${playground}`)
  })
  process.exit()
}

execSync(`ts-node ./playground/${path}`, { stdio: 'inherit' })
