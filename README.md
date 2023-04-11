# [DEPRECATED] Safe Account Abstraction SDK

ATTENTION: please find the current version of this code in [Safe Core SDK](https://github.com/safe-global/safe-core-sdk) repository

[![GitHub](https://img.shields.io/github/license/safe-global/account-abstraction-sdk)](https://github.com/safe-global/account-abstraction-sdk/blob/main/LICENSE.md)

DESCRIPTION TBD

## Packages

| Package | Release | Description |
| ------- | :-----: | ----------- |
| [account-abstraction](https://github.com/safe-global/account-abstraction-sdk/tree/main/packages/account-abstraction-kit) | [![NPM Version](https://badge.fury.io/js/%40safe-global%2Fsafe-core.svg)](https://badge.fury.io/js/%40safe-global%2Faccount-abstraction-kit-poc) | TBD |
| [auth-kit](https://github.com/safe-global/account-abstraction-sdk/tree/main/packages/auth-kit) | [![NPM Version](https://badge.fury.io/js/%40safe-global%2Fauth-kit.svg)](https://badge.fury.io/js/%40safe-global%2Fauth-kit) | Enable web2 logins for blockchain accounts  |
| [onramp-kit](https://github.com/safe-global/account-abstraction-sdk/tree/main/packages/onramp-kit) | [![NPM Version](https://badge.fury.io/js/%40safe-global%2Fonramp-kit.svg)](https://badge.fury.io/js/%40safe-global%2Fonramp-kit) | Enable transition from fiat to crypto |
| [relay-kit](https://github.com/safe-global/account-abstraction-sdk/tree/main/packages/relay-kit) | [![NPM Version](https://badge.fury.io/js/%40safe-global%2Frelay-kit.svg)](https://badge.fury.io/js/%40safe-global%2Frelay-kit) | Abstract Safe signers from transaction gas |


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

## <a name="build">Playground</a>

This project includes a [playground](https://github.com/safe-global/account-abstraction-sdk/tree/main/playground) with a few scripts that can be used as a starting point to use the Safe Account Abstraction SDK.

#### Check all the scripts in the playground

```bash
yarn play
```

#### 1. Execute meta-transaction via Gelato Relay paid with balance in the Safe

```bash
yarn play paid-transaction
```

#### 2. Execute meta-transaction via Gelato Relay paid by 1Balance deposit

```bash
yarn play sponsored-transaction
```
