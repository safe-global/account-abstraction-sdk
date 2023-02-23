# Relay Provider

[![NPM Version](https://badge.fury.io/js/%40safe-global%2Frelay-provider.svg)](https://badge.fury.io/js/%40safe-global%2Frelay-provider)
[![GitHub Release](https://img.shields.io/github/release/safe-global/account-abstraction-sdk.svg?style=flat)](https://github.com/safe-global/account-abstraction-sdk/releases)
[![GitHub](https://img.shields.io/github/license/safe-global/account-abstraction-sdk)](https://github.com/safe-global/account-abstraction-sdk/blob/main/packages/relay-provider/LICENSE.md)

Description TBD

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

Create an instance of GelatoNetworkRelay to execute transactions paid with balance in the Safe.

```typescript
const relayProvider = new GelatoNetworkRelay()

relayProvider.relayTransaction({
  target: '0x00000000000000000000', // the Safe address
  encodedTransaction: '0x0', // Transaction data encoded
  chainId: '0x5'
})

```

#### Gelato 1Balance

Create an instance of GelatoNetworkRelay to Execute transactions paid by 1Balance deposit.
To to use Gelato 1Balance an API KEY is needed. Go to https://relay.gelato.network to get a testnet API key with 1Balance.

```typescript
const relayProvider = new GelatoNetworkRelay(GELATO_RELAY_API_KEY)

relayProvider.relayTransaction({
  target: '0x00000000000000000000', // the Safe address
  encodedTransaction: '0x0', // Transaction data encoded
  chainId: '0x5',
  options: {
    isSponsored: true // This parameter is mandatory to use the 1Balance method
  }
})

```

## <a name="license">License</a>

This library is released under MIT.
