# Relay Kit

[![NPM Version](https://badge.fury.io/js/%40safe-global%2Frelay-kit.svg)](https://badge.fury.io/js/%40safe-global%2Frelay-kit)
[![GitHub Release](https://img.shields.io/github/release/safe-global/account-abstraction-sdk.svg?style=flat)](https://github.com/safe-global/account-abstraction-sdk/releases)
[![GitHub](https://img.shields.io/github/license/safe-global/account-abstraction-sdk)](https://github.com/safe-global/account-abstraction-sdk/blob/main/packages/relay-kit/LICENSE.md)

Description TBD

## Reference

  - [Relay Kit docs](https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk/relay-kit)


## Table of contents

- [Installation](#installation)
- [Build](#build)
- [Initialization](#initialization)
- [License](#license)

## <a name="installation">Installation</a>

Install the package with yarn or npm:

```bash
yarn install
npm install
```

## <a name="build">Build</a>

Build the package with yarn or npm:

```bash
yarn build
npm build
```

## <a name="initialization">Initialization</a>

### Gelato relay

#### Gelato sync balance

Create an instance of `GelatoRelay` to execute transactions paid with balance in the Safe.

```typescript
import { GelatoRelayAdapter } from '@safe-global/relay-kit'

const relayAdapter = new GelatoRelayAdapter()

relayAdapter.relayTransaction({
  target: '0x...', // the Safe address
  encodedTransaction: '0x...', // Encoded Safe transaction data
  chainId: 5
})
```

#### Gelato 1Balance

Create an instance of `GelatoRelay` to execute transactions paid by 1Balance deposit.
To to use Gelato 1Balance an API key is needed. Go to https://relay.gelato.network to get a testnet API key with 1Balance.

```typescript
import { GelatoRelayAdapter, MetaTransactionOptions } from '@safe-global/relay-kit'

const relayAdapter = new GelatoRelayAdapter(GELATO_RELAY_API_KEY)

const options: MetaTransactionOptions = {
  isSponsored: true // This parameter is mandatory to use the 1Balance method
}
relayAdapter.relayTransaction({
  target: '0x...', // the Safe address
  encodedTransaction: '0x...', // Encoded Safe transaction data
  chainId: 5,
  options
})
```

## <a name="license">License</a>

This library is released under MIT.
